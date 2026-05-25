require("dotenv").config();
const https = require("https");
const http  = require("http");
const fs    = require("fs");
const path  = require("path");
const express = require("express");

const { getOrder, getPayments, extractCommission } = require("./mlClient");
const { processSale } = require("./sheetsClient");
const { getSKU } = require("./skuMapper");

// ─── WhatsApp (CallMeBot) ─────────────────────────────────────────────────────

function sendWhatsApp(text) {
  const phone  = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return Promise.resolve();
  const urlPath = `/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apikey}`;
  return new Promise((resolve) => {
    https.get({ hostname: "api.callmebot.com", path: urlPath }, (res) => {
      res.resume();
      res.on("end", resolve);
    }).on("error", (err) => {
      console.warn("[WhatsApp] Error:", err.message);
      resolve();
    });
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function updateEnvFile(key, value) {
  try {
    const envPath = path.resolve(__dirname, ".env");
    let content = fs.readFileSync(envPath, "utf8");
    const regex = new RegExp(`^${key}=.*$`, "m");
    content = regex.test(content)
      ? content.replace(regex, `${key}=${value}`)
      : content + `\n${key}=${value}`;
    fs.writeFileSync(envPath, content, "utf8");
  } catch (_) {}
}

function httpsPost(hostname, urlPath, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path: urlPath, method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded",
                   "Content-Length": Buffer.byteLength(body) } },
      (res) => { let d = ""; res.on("data", c => d += c); res.on("end", () => resolve(JSON.parse(d))); }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Sincronización de reloj (skew Google) ───────────────────────────────────

function syncClock() {
  return new Promise((resolve) => {
    https.get("https://oauth2.googleapis.com/token", (res) => {
      const date = res.headers["date"];
      res.resume();
      if (date) {
        const skewMs = new Date(date).getTime() - Date.now();
        if (Math.abs(skewMs) > 5000) {
          console.log(`[Clock] Skew: ${Math.round(skewMs / 1000)}s — corrigiendo Date.now()`);
          const orig = Date.now.bind(Date);
          Date.now = () => orig() + skewMs;
        }
      }
      resolve();
    }).on("error", resolve);
  });
}

// ─── OAuth ML ────────────────────────────────────────────────────────────────

const PUBLIC_URL   = process.env.PUBLIC_URL || "https://webhook-production-f90b.up.railway.app";
const REDIRECT_URI = `${PUBLIC_URL}/auth/callback`;
const ML_AUTH_URL  =
  `https://auth.mercadolibre.com.ar/authorization?response_type=code` +
  `&client_id=${process.env.ML_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=offline_access`;

async function saveToRailway(vars) {
  const railwayToken = process.env.RAILWAY_TOKEN;
  if (!railwayToken) return;
  const mutation = `mutation { variableCollectionUpsert(input: { projectId: "${process.env.RAILWAY_PROJECT_ID}", serviceId: "${process.env.RAILWAY_SERVICE_ID}", environmentId: "${process.env.RAILWAY_ENVIRONMENT_ID}", variables: { ${Object.entries(vars).map(([k,v]) => `${k}: "${v}"`).join(", ")} } }) }`;
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: mutation });
    const req = https.request(
      { hostname: "backboard.railway.app", path: "/graphql/v2", method: "POST",
        headers: { "Authorization": `Bearer ${railwayToken}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => { res.resume(); res.on("end", () => { console.log("[Railway] Variables persistidas"); resolve(); }); }
    );
    req.on("error", (e) => { console.warn("[Railway] Error guardando vars:", e.message); resolve(); });
    req.write(body);
    req.end();
  });
}

async function saveTokens(data) {
  process.env.ML_ACCESS_TOKEN  = data.access_token;
  process.env.ML_TOKEN_EXPIRES = String(Date.now() + (data.expires_in || 21600) * 1000);
  updateEnvFile("ML_ACCESS_TOKEN", data.access_token);

  const railwayVars = { ML_ACCESS_TOKEN: data.access_token };

  if (data.refresh_token) {
    process.env.ML_REFRESH_TOKEN = data.refresh_token;
    updateEnvFile("ML_REFRESH_TOKEN", data.refresh_token);
    railwayVars.ML_REFRESH_TOKEN = data.refresh_token;
    console.log("[Auth] Refresh token guardado — renovación automática activa");
  }
  if (data.user_id) {
    process.env.ML_SELLER_ID = String(data.user_id);
    updateEnvFile("ML_SELLER_ID", String(data.user_id));
    railwayVars.ML_SELLER_ID = String(data.user_id);
  }

  await saveToRailway(railwayVars);
}

// ─── Express ─────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// ML valida el endpoint con GET antes de activar el webhook
app.get("/webhook/mercadolibre", (_req, res) => res.sendStatus(200));

// ── Webhook principal ──────────────────────────────────────────────────────
app.post("/webhook/mercadolibre", async (req, res) => {
  res.sendStatus(200); // responder rápido para que ML no reintente

  const { topic, resource } = req.body || {};
  if (topic !== "orders_v2" && topic !== "orders") return;

  const orderId = resource?.split("/").pop();
  if (!orderId || !/^\d+$/.test(orderId)) return;

  try {
    console.log(`[Webhook] Orden ${orderId}`);
    const order = await getOrder(orderId);

    if (!["paid", "confirmed"].includes(order.status)) {
      console.log(`[Webhook] Ignorada — estado: "${order.status}"`);
      return;
    }

    const payments = await getPayments(orderId);
    const comision = extractCommission(payments);

    let salesRegistered = 0;
    for (const item of order.order_items) {
      const sku      = await getSKU(item.item);
      const variante = item.item.variation_attributes?.map(a => a.value_name).join(" / ") || "";

      if (sku === "DESCONOCIDO") console.warn(`[Webhook] SKU no resuelto: "${item.item.title}"`);

      const saleNum = await processSale({
        fecha:         new Date(order.date_created).toLocaleDateString("es-AR"),
        orderId:       String(order.id),
        sku,
        nombre:        item.item.title,
        variante,
        cantidad:      item.quantity,
        precioUnitario: item.unit_price,
        total:         order.total_amount,
        comision,
      });

      if (saleNum !== null) {
        console.log(`[Webhook] Venta #${saleNum} registrada — orden ${order.id}`);
        salesRegistered++;
      }
    }

    if (salesRegistered > 0) {
      const resumen = order.order_items
        .map(i => `${i.item.title} x${i.quantity}`)
        .join(", ");
      await sendWhatsApp(
        `🐾 Nueva venta ML\n📦 Orden ${order.id}\n🏷 ${resumen}\n💰 $${order.total_amount}`
      );
    }
  } catch (err) {
    console.error(`[Webhook] Error orden ${orderId}:`, err.message);
  }
});

// ── OAuth: iniciar autorización ────────────────────────────────────────────
app.get("/auth", (_req, res) => {
  console.log("[Auth] Iniciando flujo OAuth ML");
  res.redirect(ML_AUTH_URL);
});

// ── OAuth: callback de ML (recibe el code y lo intercambia por tokens) ─────
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Falta el código de autorización.");

  try {
    const data = await httpsPost(
      "api.mercadolibre.com",
      "/oauth/token",
      new URLSearchParams({
        grant_type:    "authorization_code",
        client_id:     process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        code,
        redirect_uri:  REDIRECT_URI,
      }).toString()
    );

    if (!data.access_token) throw new Error(JSON.stringify(data));

    await saveTokens(data);
    console.log("[Auth] Tokens actualizados correctamente");

    const hasRefresh = !!data.refresh_token;
    res.send(`
      <h2>✓ ZetaPets — Autorización exitosa</h2>
      <p>Access Token actualizado.</p>
      ${hasRefresh
        ? "<p><strong>✓ Refresh Token obtenido</strong> — el token se renovará automáticamente.</p>"
        : "<p>⚠ Sin Refresh Token — el token dura 6 hs. Volvé a entrar a <a href='/auth'>/auth</a> antes de que expire.</p>"
      }
    `);
  } catch (err) {
    console.error("[Auth] Error:", err.message);
    res.status(500).send(`Error al obtener tokens: ${err.message}`);
  }
});

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  const expiresAt  = Number(process.env.ML_TOKEN_EXPIRES || 0);
  const msLeft     = expiresAt - Date.now();
  const horasLeft  = Math.max(0, msLeft / 1000 / 3600).toFixed(1);
  const tokenOk    = msLeft > 0;
  res.json({
    status:       "ok",
    service:      "ZetaPets ML Webhook",
    token:        tokenOk ? `válido por ${horasLeft}h más` : `⚠ EXPIRADO — renovar en ${PUBLIC_URL}/auth`,
    refreshToken: process.env.ML_REFRESH_TOKEN ? "activo" : "no configurado",
  });
});

// ─── Arranque ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
syncClock().then(() => {
  app.listen(PORT, () => {
    console.log(`ZetaPets webhook corriendo en puerto ${PORT}`);
    console.log(`Para re-autorizar ML: ${PUBLIC_URL}/auth`);
  });
});
