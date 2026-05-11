export const ZONES = [
  { name: "CABA",              min: 1000, max: 1499, price: 3500 },
  { name: "Gran Buenos Aires", min: 1500, max: 2999, price: 4500 },
  { name: "Interior",          min: 3000, max: 9999, price: 6500 },
]

export const FREE_SHIPPING_THRESHOLD = 80000

// Retiro en local — dirección a confirmar post-pago
export const PICKUP_INFO = {
  name:    "Retiro en local",
  zone:    "Villa Crespo, CABA",
  address: "", // se completa cuando el local tenga dirección definitiva
  note:    "Te confirmaremos la dirección exacta por email una vez realizado el pago.",
}

function normalizePostalCode(postalCode) {
  if (!postalCode) return NaN
  const cp = String(postalCode).trim().toUpperCase()
  // Formato alfanumérico argentino: C1200AAF → extraer los 4 dígitos del medio
  const alphaMatch = cp.match(/^[A-Z](\d{4})/)
  if (alphaMatch) return parseInt(alphaMatch[1], 10)
  return parseInt(cp, 10)
}

export function getShippingCost(postalCode, subtotal, deliveryMethod = "shipping") {
  if (deliveryMethod === "pickup") return 0
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  const cp = normalizePostalCode(postalCode)
  if (isNaN(cp)) return 6500
  const zone = ZONES.find((z) => cp >= z.min && cp <= z.max)
  return zone ? zone.price : 6500
}

export function getZoneName(postalCode) {
  const cp = normalizePostalCode(postalCode)
  if (isNaN(cp)) return "Interior"
  const zone = ZONES.find((z) => cp >= z.min && cp <= z.max)
  return zone ? zone.name : "Interior"
}
