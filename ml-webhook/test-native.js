/**
 * Test de conexión usando solo módulos nativos de Node.js (sin npm).
 */
const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Cargar .env manualmente
const envPath = path.join(__dirname, ".env");
const env = {};
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
});

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    }).on("error", reject);
  });
}

function httpsPost(hostname, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: "POST", headers: { "Content-Length": Buffer.byteLength(bodyStr), ...headers } },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      }
    );
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

function b64url(buf) {
  return (Buffer.isBuffer(buf) ? buf : Buffer.from(buf))
    .toString("base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getGoogleServerTime() {
  return new Promise((resolve) => {
    https.get("https://oauth2.googleapis.com/token", (res) => {
      const dateHeader = res.headers["date"];
      res.resume();
      resolve(dateHeader ? Math.floor(new Date(dateHeader).getTime() / 1000) : Math.floor(Date.now() / 1000));
    }).on("error", () => resolve(Math.floor(Date.now() / 1000)));
  });
}

async function getGoogleToken() {
  const now = await getGoogleServerTime();
  const header  = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const sigInput = `${header}.${payload}`;
  const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const sig = b64url(crypto.sign("sha256", Buffer.from(sigInput), { key: privateKey, dsaEncoding: "ieee-p1363" }));

  // Usar firma PKCS1 correcta
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(sigInput);
  const signature = b64url(signer.sign(privateKey));
  const jwt = `${sigInput}.${signature}`;

  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await httpsPost("oauth2.googleapis.com", "/token", body, {
    "Content-Type": "application/x-www-form-urlencoded",
  });
  if (!res.data.access_token) throw new Error(JSON.stringify(res.data));
  return res.data.access_token;
}

async function testML() {
  process.stdout.write("Mercado Libre...  ");
  const res = await httpsGet("https://api.mercadolibre.com/users/me", {
    Authorization: `Bearer ${env.ML_ACCESS_TOKEN}`,
  });
  if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.data)}`);
  console.log(`OK ✓  — cuenta: ${res.data.nickname} (ID ${res.data.id})`);
}

async function testSheets() {
  process.stdout.write("Google Sheets...  ");
  const token = await getGoogleToken();
  const sheetId = env.GOOGLE_SHEET_ID;
  const res = await httpsGet(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title,sheets.properties.title`,
    { Authorization: `Bearer ${token}` }
  );
  if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.data)}`);
  const sheetNames = res.data.sheets.map((s) => s.properties.title).join(", ");
  console.log(`OK ✓  — "${res.data.properties.title}" | Hojas: ${sheetNames}`);
  if (!res.data.sheets.some((s) => s.properties.title === "VENTAS"))
    console.warn("  ⚠ No se encontró la hoja VENTAS");
  if (!res.data.sheets.some((s) => s.properties.title === "STOCK"))
    console.warn("  ⚠ No se encontró la hoja STOCK");
}

(async () => {
  console.log("\n=== Test de conexión ZetaPets ===\n");
  try { await testML();     } catch (e) { console.log(`ERROR ✗ — ${e.message}`); }
  try { await testSheets(); } catch (e) { console.log(`ERROR ✗ — ${e.message}`); }
  console.log();
})();
