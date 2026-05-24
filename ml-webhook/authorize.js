/**
 * Script de un solo uso para obtener el Access Token y Refresh Token de ML.
 * Ejecutar: node authorize.js
 *
 * Pasos:
 *   1. Completar ML_CLIENT_ID y ML_CLIENT_SECRET en .env
 *   2. Ejecutar este script — abre una URL en el browser
 *   3. Autorizar la app con la cuenta vendedora
 *   4. Copiar el ?code=... de la URL de redirección
 *   5. Pegar el código aquí cuando se pida
 */
require("dotenv").config();
const axios = require("axios");
const readline = require("readline");

const CLIENT_ID = process.env.ML_CLIENT_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
// Esta redirect_uri debe coincidir exactamente con la configurada en el portal de ML
const REDIRECT_URI = "https://zetapets.vercel.app";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Faltan ML_CLIENT_ID o ML_CLIENT_SECRET en el archivo .env");
  process.exit(1);
}

const authUrl =
  `https://auth.mercadolibre.com.ar/authorization` +
  `?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log("\n=== Autorización Mercado Libre ===");
console.log("\n1. Abrí esta URL en el browser (con la cuenta vendedora de ML):");
console.log("\n   " + authUrl);
console.log("\n2. Autorizá la app.");
console.log("3. Te va a redirigir a una URL tipo:");
console.log("   https://zetapets.vercel.app/?code=TG-XXXXXXXXXXXX-XXXXXXXX");
console.log("4. Copiá solo el valor del parámetro ?code=...\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Pegá el código aquí: ", async (code) => {
  rl.close();
  try {
    const { data } = await axios.post(
      "https://api.mercadolibre.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code.trim(),
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("\n✓ Tokens obtenidos. Agregá estas líneas a tu .env:\n");
    console.log(`ML_ACCESS_TOKEN=${data.access_token}`);
    console.log(`ML_REFRESH_TOKEN=${data.refresh_token}`);
    console.log(`ML_SELLER_ID=${data.user_id}`);
  } catch (err) {
    console.error("\nError al obtener tokens:", err.response?.data || err.message);
  }
});
