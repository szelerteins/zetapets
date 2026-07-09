/**
 * lib/admin-session.js
 *
 * Firma y verifica tokens de sesión de admin usando HMAC-SHA256
 * a través de la Web Crypto API (compatible con Edge Runtime y Node.js 18+).
 *
 * Requiere la variable de entorno ADMIN_SESSION_SECRET con un string largo y aleatorio.
 * Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    "zetapets-dev-secret-CHANGE-IN-PRODUCTION-use-random-64-chars"
  )
}

async function getHmacKey(usage) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  )
}

/** Crea un token firmado: "admin|<timestamp>|<hmac-hex>" */
export async function createSessionToken() {
  const payload = `admin|${Date.now()}`
  const key = await getHmacKey("sign")
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  )
  const sig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${payload}|${sig}`
}

/** Verifica un token firmado. Retorna true si es válido. */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false
  const lastPipe = token.lastIndexOf("|")
  if (lastPipe === -1) return false
  const payload = token.slice(0, lastPipe)
  const sig = token.slice(lastPipe + 1)
  if (!payload.startsWith("admin|") || sig.length !== 64) return false
  try {
    const key = await getHmacKey("verify")
    const sigBytes = new Uint8Array(
      sig.match(/.{2}/g).map((h) => parseInt(h, 16))
    )
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload)
    )
  } catch {
    return false
  }
}
