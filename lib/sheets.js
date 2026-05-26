import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const VENTAS_SHEET = "VENTAS"
const STOCK_SHEET = "STOCK"

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  if (!email || !key) return null
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
}

async function getSheetsClient() {
  const auth = getAuth()
  if (!auth) throw new Error("Google Sheets no configurado — faltan variables de entorno")
  return google.sheets({ version: "v4", auth })
}

function isSheetsConfigured() {
  return !!(SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)
}

async function withRetry(fn, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const status = err?.response?.status
      if ((status === 429 || status >= 500) && attempt < retries) {
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 8000)))
        continue
      }
      throw err
    }
  }
}

async function readVentasSnapshot(sheets) {
  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${VENTAS_SHEET}!A:D`,
    })
  )
  const rows = res.data.values || []
  const dataRows = rows.slice(1)
  const numbers = dataRows.map(r => Number(r[0])).filter(n => n > 0)
  const lastNum = numbers.length ? Math.max(...numbers) : 0
  const existingOrderIds = new Set(dataRows.map(r => String(r[3] || "")).filter(Boolean))
  return { lastNum, existingOrderIds }
}

export async function appendWebSale(saleData) {
  if (!isSheetsConfigured()) {
    console.warn("[Sheets] No configurado — omitiendo registro de venta web")
    return null
  }
  try {
    const sheets = await getSheetsClient()
    const { lastNum, existingOrderIds } = await readVentasSnapshot(sheets)

    const orderIdStr = String(saleData.orderId)
    if (existingOrderIds.has(orderIdStr)) {
      console.log(`[Sheets] Orden ${orderIdStr} ya registrada`)
      return null
    }

    const nextNum = lastNum + 1
    const { fecha, orderId, sku, nombre, variante, cantidad, precioUnitario, total } = saleData

    const row = [
      nextNum,
      fecha,
      "Web",
      orderId,
      sku || "",
      nombre,
      variante || "",
      cantidad,
      precioUnitario,
      total,
      0,
      total,
      "Confirmada",
      "",
    ]

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${VENTAS_SHEET}!A:N`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] },
      })
    )

    console.log(`[Sheets] Venta web #${nextNum} registrada — Orden ${orderId}`)
    return nextNum
  } catch (err) {
    console.error("[Sheets] Error al registrar venta web:", err.message)
    return null
  }
}

export async function decrementStockVentas(sku, cantidad) {
  if (!isSheetsConfigured() || !sku) return
  try {
    const sheets = await getSheetsClient()
    const res = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${STOCK_SHEET}!A:E`,
      })
    )

    const rows = res.data.values || []
    const rowIndex = rows.findIndex((r, i) => i > 0 && (r[0] || "").trim() === sku.trim())
    if (rowIndex === -1) {
      console.warn(`[Sheets] SKU "${sku}" no encontrado en STOCK`)
      return
    }

    const sheetRow = rowIndex + 1
    const currentVentas = Number(rows[rowIndex][4]) || 0

    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${STOCK_SHEET}!E${sheetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[currentVentas + cantidad]] },
      })
    )

    console.log(`[Sheets] STOCK actualizado — SKU ${sku}: ${currentVentas} → ${currentVentas + cantidad}`)
  } catch (err) {
    console.error("[Sheets] Error al actualizar STOCK:", err.message)
  }
}

export async function validateSKU(sku) {
  if (!isSheetsConfigured()) {
    return { valid: false, error: "Google Sheets no configurado en el servidor" }
  }
  try {
    const sheets = await getSheetsClient()
    const res = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${STOCK_SHEET}!A:F`,
      })
    )

    const rows = res.data.values || []
    const dataRows = rows.slice(1)
    const found = dataRows.find(r => (r[0] || "").trim() === sku.trim())

    if (!found) {
      return { valid: false, error: `SKU "${sku}" no encontrado en el Excel` }
    }

    return {
      valid: true,
      nombre: found[1] || "",
      stockActual: Number(found[5]) || 0,
      ventasRegistradas: Number(found[4]) || 0,
    }
  } catch (err) {
    console.error("[Sheets] Error al validar SKU:", err.message)
    return { valid: false, error: "Error al conectar con el Excel: " + err.message }
  }
}
