/**
 * Resolución de SKU — tres capas en orden de prioridad:
 *
 * 1. seller_custom_field del ítem de ML ("Código de vendedor" en el formulario)
 *    → El usuario llena ese campo al crear la publicación con su SKU interno.
 *    → No requiere ninguna configuración adicional.
 *
 * 2. STOCK sheet (caché en memoria, se refresca cada hora)
 *    → Busca coincidencia entre el título del ítem y la columna "Nombre" del STOCK.
 *    → Normaliza el texto (minúsculas, sin tildes) para tolerar pequeñas diferencias.
 *
 * 3. Mapa estático hardcodeado (fallback manual, poco a poco se vuelve innecesario)
 */

const { google } = require("googleapis");

const SHEET_ID    = process.env.GOOGLE_SHEET_ID;
const STOCK_SHEET = "STOCK";

// Cache del STOCK sheet: { nombreNormalizado → sku }
let stockCache = {};
let lastFetch  = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // quitar tildes
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

// Refresca el cache del STOCK si pasó más de 1 hora
async function refreshStockCache() {
  if (Date.now() - lastFetch < CACHE_TTL) return;
  try {
    const sheets = google.sheets({ version: "v4", auth: getAuth() });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${STOCK_SHEET}!A:B`, // A=SKU, B=Nombre
    });
    const rows = (res.data.values || []).slice(1); // saltar encabezado
    const newCache = {};
    for (const row of rows) {
      const sku    = (row[0] || "").trim();
      const nombre = (row[1] || "").trim();
      if (sku && nombre) {
        newCache[normalize(nombre)] = sku;
      }
    }
    stockCache = newCache;
    lastFetch  = Date.now();
    console.log(`[SKU] Cache STOCK actualizado: ${Object.keys(newCache).length} productos`);
  } catch (err) {
    console.warn("[SKU] No se pudo refrescar cache del STOCK:", err.message);
  }
}

// Busca en el cache por coincidencia exacta o parcial normalizada
function lookupInStock(titulo) {
  const normTitulo = normalize(titulo);

  // Coincidencia exacta
  if (stockCache[normTitulo]) return stockCache[normTitulo];

  // Coincidencia parcial: el nombre del STOCK está contenido en el título ML
  for (const [nombre, sku] of Object.entries(stockCache)) {
    if (nombre.length > 4 && normTitulo.includes(nombre)) return sku;
  }

  // Coincidencia parcial inversa: el título ML está contenido en el nombre del STOCK
  for (const [nombre, sku] of Object.entries(stockCache)) {
    if (normTitulo.length > 4 && nombre.includes(normTitulo)) return sku;
  }

  return null;
}

// Mapa estático de respaldo (opcional, agregar si hay casos difíciles)
const STATIC_MAP = {
  // "nombre normalizado": "SKU",
};

/**
 * Resuelve el SKU dado un ítem de ML.
 * @param {object} mlItem - objeto item de la orden ML (item.item)
 * @param {string} mlItem.title - título de la publicación
 * @param {string} [mlItem.seller_custom_field] - código de vendedor (SKU interno)
 * @returns {Promise<string>} SKU resuelto o "DESCONOCIDO"
 */
async function getSKU(mlItem) {
  // 1. Campo "Código de vendedor" de ML (máxima prioridad)
  const sellerField = (mlItem.seller_custom_field || "").trim();
  if (sellerField) {
    console.log(`[SKU] Resuelto por seller_custom_field: "${sellerField}"`);
    return sellerField;
  }

  const titulo = mlItem.title || "";

  // 2. Cache del STOCK sheet
  await refreshStockCache();
  const fromStock = lookupInStock(titulo);
  if (fromStock) {
    console.log(`[SKU] Resuelto por STOCK sheet: "${fromStock}" para "${titulo}"`);
    return fromStock;
  }

  // 3. Mapa estático
  const normTitulo = normalize(titulo);
  if (STATIC_MAP[normTitulo]) {
    console.log(`[SKU] Resuelto por mapa estático: "${STATIC_MAP[normTitulo]}"`);
    return STATIC_MAP[normTitulo];
  }

  console.warn(`[SKU] No resuelto para: "${titulo}"`);
  return "DESCONOCIDO";
}

module.exports = { getSKU };
