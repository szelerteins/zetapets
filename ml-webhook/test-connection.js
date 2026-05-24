/**
 * Verifica la conexión con Google Sheets y con la API de ML.
 * Ejecutar: node test-connection.js
 */
require("dotenv").config();
const { google } = require("googleapis");
const axios = require("axios");

async function testSheets() {
  process.stdout.write("Google Sheets... ");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    fields: "properties.title,sheets.properties.title",
  });
  const sheetNames = res.data.sheets.map((s) => s.properties.title).join(", ");
  console.log(`OK ✓  — "${res.data.properties.title}" | Hojas: ${sheetNames}`);

  const tieneVentas = res.data.sheets.some((s) => s.properties.title === "VENTAS");
  const tieneStock  = res.data.sheets.some((s) => s.properties.title === "STOCK");
  if (!tieneVentas) console.warn("  ⚠ No se encontró la hoja VENTAS");
  if (!tieneStock)  console.warn("  ⚠ No se encontró la hoja STOCK");
}

async function testML() {
  process.stdout.write("Mercado Libre...  ");
  const { data } = await axios.get("https://api.mercadolibre.com/users/me", {
    headers: { Authorization: `Bearer ${process.env.ML_ACCESS_TOKEN}` },
  });
  console.log(`OK ✓  — cuenta: ${data.nickname} (ID ${data.id})`);
}

(async () => {
  console.log("\n=== Test de conexión ZetaPets ===\n");
  try { await testSheets(); } catch (e) { console.log("ERROR ✗ —", e.message); }
  try { await testML();     } catch (e) { console.log("ERROR ✗ —", e.message); }
  console.log();
})();
