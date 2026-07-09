/**
 * lib/mercadopago.js
 *
 * Configura el cliente de Mercado Pago.
 *
 * Variables de entorno:
 *   MP_SANDBOX=true                          → activa modo sandbox (desarrollo/testing)
 *   MERCADOPAGO_SANDBOX_ACCESS_TOKEN=TEST-…  → token de prueba (obtenido en el panel MP)
 *   MERCADOPAGO_ACCESS_TOKEN=APP_USR-…       → token de producción (solo para Vercel prod)
 *
 * En .env.local: MP_SANDBOX=true  (nunca usar credenciales reales en local)
 * En Vercel:     MP_SANDBOX=false (credenciales de producción)
 */

import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

export function getMercadoPagoClient() {
  const useSandbox = process.env.MP_SANDBOX === "true"

  const token = useSandbox
    ? process.env.MERCADOPAGO_SANDBOX_ACCESS_TOKEN
    : process.env.MERCADOPAGO_ACCESS_TOKEN

  const varName = useSandbox
    ? "MERCADOPAGO_SANDBOX_ACCESS_TOKEN"
    : "MERCADOPAGO_ACCESS_TOKEN"

  if (!token) {
    throw new Error(
      `${varName} no configurado. ` +
      (useSandbox
        ? "Obtené tu token de prueba en mercadopago.com.ar → Developers → Credenciales → Prueba."
        : "Configurá el token de producción en las variables de entorno de Vercel.")
    )
  }

  return new MercadoPagoConfig({ accessToken: token })
}

export { Preference, Payment }
