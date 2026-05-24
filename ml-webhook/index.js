require("dotenv").config();
const https = require("https");
const express = require("express");

// El reloj del sistema puede tener skew respecto a Google. Sincronizamos una
// vez al arrancar y parchamos Date.now() para que googleapis genere JWTs válidos.
function syncClock() {
  return new Promise((resolve) => {
    https.get("https://oauth2.googleapis.com/token", (res) => {
      const date = res.headers["date"];
      res.resume();
      if (date) {
        const serverMs = new Date(date).getTime();
        const localMs  = Date.now();
        const skewMs   = serverMs - localMs;
        if (Math.abs(skewMs) > 5000) {
          console.log(`[Clock] Skew detectado: ${Math.round(skewMs / 1000)}s. Corrigiendo Date.now()`);
          const orig = Date.now.bind(Date);
          Date.now = () => orig() + skewMs;
        }
      }
      resolve();
    }).on("error", resolve);
  });
}
const { getOrder, getPayments, extractCommission } = require("./mlClient");
const { processSale } = require("./sheetsClient");
const { getSKU } = require("./skuMapper");

const app = express();
app.use(express.json());

// ML valida la URL del webhook con un GET antes de activarla
app.get("/webhook/mercadolibre", (req, res) => res.sendStatus(200));

app.post("/webhook/mercadolibre", async (req, res) => {
  // Responder 200 de inmediato — ML reintenta si no recibe respuesta rápida
  res.sendStatus(200);

  const { topic, resource } = req.body || {};

  // Solo procesar notificaciones de órdenes
  if (topic !== "orders_v2" && topic !== "orders") return;

  // resource tiene la forma "/orders/1234567890"
  const orderId = resource?.split("/").pop();
  if (!orderId || !/^\d+$/.test(orderId)) return;

  try {
    console.log(`[Webhook] Notificación recibida — Orden ${orderId}`);
    const order = await getOrder(orderId);

    // Solo procesar órdenes confirmadas/pagadas
    if (!["paid", "confirmed"].includes(order.status)) {
      console.log(`[Webhook] Orden ${orderId} ignorada — estado: "${order.status}"`);
      return;
    }

    const payments = await getPayments(orderId);
    const comision = extractCommission(payments);

    // Una orden puede tener múltiples ítems; se inserta una fila por ítem
    for (const item of order.order_items) {
      const titulo = item.item.title;
      const sku = await getSKU(item.item); // resuelve por seller_custom_field → STOCK → fallback

      if (sku === "DESCONOCIDO") {
        console.warn(`[Webhook] SKU no resuelto para: "${titulo}"`);
      }

      const variante =
        item.item.variation_attributes
          ?.map((a) => a.value_name)
          .join(" / ") || "";

      const saleData = {
        fecha: new Date(order.date_created).toLocaleDateString("es-AR"),
        orderId: String(order.id),
        sku,
        nombre: titulo,
        variante,
        cantidad: item.quantity,
        precioUnitario: item.unit_price,
        total: order.total_amount,
        comision,
      };

      const saleNum = await processSale(saleData);
      if (saleNum !== null) {
        console.log(`[Webhook] OK — Venta #${saleNum} registrada para orden ${order.id}`);
      }
    }
  } catch (err) {
    // No tirar error — ya respondimos 200; solo loguear para diagnóstico
    console.error(`[Webhook] Error procesando orden ${orderId}:`, err.message);
    if (err.response?.data) {
      console.error("[Webhook] Detalle:", JSON.stringify(err.response.data));
    }
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ZetaPets ML Webhook" });
});

const PORT = process.env.PORT || 3000;
syncClock().then(() => {
  app.listen(PORT, () => {
    console.log(`ZetaPets webhook corriendo en puerto ${PORT}`);
  });
});
