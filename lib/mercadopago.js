import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

export function getMercadoPagoClient() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado")
  }
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  })
}

export { Preference, Payment }
