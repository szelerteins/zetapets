const { google } = require("googleapis");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const VENTAS_SHEET = "VENTAS";
const STOCK_SHEET = "STOCK";

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

// Reintenta una función async con backoff exponencial ante errores 429/500
async function withRetry(fn, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.response?.status;
      const isRetryable = status === 429 || status >= 500;
      if (!isRetryable || attempt === retries) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 16000);
      console.warn(`[Sheets] Error ${status}, reintentando en ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Lee todas las filas de VENTAS una sola vez y devuelve {rows, lastNum, existingOrderIds}
// De esta forma se evitan múltiples round-trips a la API.
async function readVentasSnapshot(sheets) {
  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      // Columnas A (N° Venta) y D (ID Orden) — suficiente para el chequeo
      range: `${VENTAS_SHEET}!A:D`,
    })
  );

  const rows = res.data.values || [];
  const dataRows = rows.slice(1); // ignorar encabezado

  // El N° de venta siguiente es el último número registrado + 1, sin importar
  // si las filas intermedias son de ML o de la web.
  const numbers = dataRows.map((r) => Number(r[0])).filter((n) => n > 0);
  const lastNum = numbers.length ? Math.max(...numbers) : 0;

  // IDs de órdenes ya registradas (col D) — para deduplicación
  const existingOrderIds = new Set(
    dataRows.map((r) => String(r[3] || "")).filter(Boolean)
  );

  return { lastNum, existingOrderIds };
}

// Inserta una nueva fila en VENTAS. Devuelve el N° de venta asignado,
// o null si la orden ya estaba registrada (duplicado).
async function appendSale(sheets, saleData) {
  const { lastNum, existingOrderIds } = await readVentasSnapshot(sheets);

  const orderIdStr = String(saleData.orderId);
  if (existingOrderIds.has(orderIdStr)) {
    console.log(`[Sheets] Orden ${orderIdStr} ya registrada — omitiendo duplicado`);
    return null;
  }

  const nextNum = lastNum + 1;
  const {
    fecha,
    orderId,
    sku,
    nombre,
    variante,
    cantidad,
    precioUnitario,
    total,
    comision,
  } = saleData;

  const ingresoNeto = total - comision;

  const row = [
    nextNum,          // A: N° Venta
    fecha,            // B: Fecha
    "MercadoLibre",   // C: Canal
    orderId,          // D: ID Orden
    sku,              // E: ID Producto (SKU)
    nombre,           // F: Nombre Producto
    variante || "",   // G: Color / Variante
    cantidad,         // H: Cantidad
    precioUnitario,   // I: Precio Unitario ARS
    total,            // J: Total ARS
    comision,         // K: Comisión ML ARS
    ingresoNeto,      // L: Ingreso Neto ARS
    "Confirmada",     // M: Estado
    "",               // N: Notas
  ];

  await withRetry(() =>
    sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${VENTAS_SHEET}!A:N`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS", // siempre agrega filas, nunca sobreescribe
      requestBody: { values: [row] },
    })
  );

  console.log(`[Sheets] Venta #${nextNum} registrada — Orden ${orderId}`);
  return nextNum;
}

// Incrementa "Ventas Registradas" (col E) del STOCK para el SKU dado.
// Lee y escribe solo la celda exacta del SKU — no toca ninguna otra fila.
async function incrementStockVentas(sheets, sku, cantidad) {
  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${STOCK_SHEET}!A:E`,
    })
  );

  const rows = res.data.values || [];
  // Buscar la fila del SKU (col A); saltar encabezado (fila 1 → índice 0)
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === sku);

  if (rowIndex === -1) {
    console.warn(`[Sheets] SKU "${sku}" no encontrado en STOCK — stock no actualizado`);
    return;
  }

  const sheetRow = rowIndex + 1; // convertir a número de fila (1-based)
  const currentVentas = Number(rows[rowIndex][4]) || 0; // col E (índice 4)

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${STOCK_SHEET}!E${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[currentVentas + cantidad]] },
    })
  );

  console.log(`[Sheets] Stock actualizado — SKU ${sku}: ventas registradas ${currentVentas} → ${currentVentas + cantidad}`);
}

// Punto de entrada principal: registra la venta y actualiza el stock.
async function processSale(saleData) {
  const sheets = await getSheetsClient();
  const saleNum = await appendSale(sheets, saleData);

  // Si era duplicado, no actualizar stock tampoco
  if (saleNum === null) return null;

  if (saleData.sku !== "DESCONOCIDO") {
    await incrementStockVentas(sheets, saleData.sku, saleData.cantidad);
  }

  return saleNum;
}

module.exports = { processSale };
