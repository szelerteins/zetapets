const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ML_BASE = "https://api.mercadolibre.com";
const ENV_PATH = path.resolve(__dirname, ".env");

function getHeaders() {
  return { Authorization: `Bearer ${process.env.ML_ACCESS_TOKEN}` };
}

// Refresca el Access Token usando el Refresh Token.
// Si no hay refresh token disponible, lanza un error claro.
async function refreshAccessToken() {
  const refreshToken = process.env.ML_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error(
      "Access Token expirado y no hay ML_REFRESH_TOKEN configurado. " +
      "Ejecutá node authorize.js para obtener un token nuevo."
    );
  }

  const { data } = await axios.post(
    `${ML_BASE}/oauth/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  // Actualizar en memoria
  process.env.ML_ACCESS_TOKEN = data.access_token;
  if (data.refresh_token) {
    process.env.ML_REFRESH_TOKEN = data.refresh_token;
  }

  // Persistir en .env para que sobreviva reinicios del servidor
  updateEnvFile("ML_ACCESS_TOKEN", data.access_token);
  if (data.refresh_token) updateEnvFile("ML_REFRESH_TOKEN", data.refresh_token);

  console.log("[ML] Token refrescado correctamente");
  return data.access_token;
}

// Reemplaza el valor de una variable en el .env sin tocar el resto
function updateEnvFile(key, value) {
  try {
    let content = fs.readFileSync(ENV_PATH, "utf8");
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
    fs.writeFileSync(ENV_PATH, content, "utf8");
  } catch (err) {
    console.warn("[ML] No se pudo actualizar .env:", err.message);
  }
}

// Wrapper que reintenta una vez si recibe 401 (token expirado)
async function mlRequest(fn) {
  try {
    return await fn(getHeaders());
  } catch (err) {
    if (err?.response?.status === 401) {
      console.warn("[ML] Token expirado, intentando refrescar...");
      await refreshAccessToken();
      return await fn(getHeaders()); // segundo intento con token nuevo
    }
    throw err;
  }
}

async function getOrder(orderId) {
  const { data } = await mlRequest((headers) =>
    axios.get(`${ML_BASE}/orders/${orderId}`, { headers })
  );
  return data;
}

async function getPayments(orderId) {
  const { data } = await mlRequest((headers) =>
    axios.get(`${ML_BASE}/orders/${orderId}/payments`, { headers })
  );
  return data.payments || [];
}

function extractCommission(payments) {
  if (!payments.length) return 0;
  return Math.abs(payments[0].marketplace_fee || 0);
}

module.exports = { getOrder, getPayments, extractCommission };
