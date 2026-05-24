/**
 * Registra la suscripción al webhook de órdenes en ML.
 * Ejecutar UNA VEZ después de tener el Access Token y la URL del servidor deployado.
 *
 * Uso: node registerWebhook.js https://tu-app.railway.app
 */
require("dotenv").config();
const axios = require("axios");

const PUBLIC_URL = process.argv[2];
if (!PUBLIC_URL) {
  console.error("Uso: node registerWebhook.js https://tu-url-publica.railway.app");
  process.exit(1);
}

const CLIENT_ID = process.env.ML_CLIENT_ID;
const ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN;

async function register() {
  try {
    const { data } = await axios.post(
      `https://api.mercadolibre.com/applications/${CLIENT_ID}/subscriptions`,
      {
        topic: "orders_v2",
        callback_url: `${PUBLIC_URL}/webhook/mercadolibre`,
      },
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
    console.log("✓ Webhook registrado:", data);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

register();
