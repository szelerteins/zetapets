/**
 * lib/andreani.js — Cliente REST para la API de Andreani
 *
 * VARIABLES DE ENTORNO REQUERIDAS:
 *   ANDREANI_USUARIO     → usuario asignado por Andreani (contactar apis@andreani.com)
 *   ANDREANI_CONTRASENA  → contraseña asignada por Andreani
 *   ANDREANI_CONTRATO    → número de contrato asignado por Andreani (ej: "400006711")
 *   ANDREANI_TEST_MODE   → "true" para usar el ambiente QA de Andreani
 *
 * DATOS DEL REMITENTE (ZetaPets):
 *   ANDREANI_REMITENTE_CP        → código postal del local/depósito
 *   ANDREANI_REMITENTE_CALLE     → calle del local (sin número)
 *   ANDREANI_REMITENTE_NUMERO    → número de calle
 *   ANDREANI_REMITENTE_LOCALIDAD → localidad (ej: "Villa Crespo")
 *   ANDREANI_REMITENTE_REGION    → provincia (ej: "Buenos Aires")
 *   ANDREANI_REMITENTE_TELEFONO  → teléfono de contacto
 *
 * Documentación oficial: https://developers.andreani.com/document
 * Contacto API:          apis@andreani.com
 */

const BASE_URL =
  process.env.ANDREANI_TEST_MODE === "true"
    ? "https://apisqa.andreani.com"
    : "https://apis.andreani.com"

// ── Autenticación ─────────────────────────────────────────────────────────────

async function getToken() {
  if (!process.env.ANDREANI_USUARIO || !process.env.ANDREANI_CONTRASENA) {
    throw new Error(
      "Andreani no configurado: faltan ANDREANI_USUARIO o ANDREANI_CONTRASENA en las variables de entorno. " +
      "Contactar a apis@andreani.com para obtener credenciales."
    )
  }

  const credentials = Buffer.from(
    `${process.env.ANDREANI_USUARIO}:${process.env.ANDREANI_CONTRASENA}`
  ).toString("base64")

  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Authorization": `Basic ${credentials}` },
  })

  if (!res.ok) {
    throw new Error(`Andreani: error de autenticación (${res.status}) — verificar ANDREANI_USUARIO y ANDREANI_CONTRASENA`)
  }

  // El token viene en el header x-authorization-token
  const token = res.headers.get("x-authorization-token")
  if (!token) throw new Error("Andreani: la respuesta de login no contiene x-authorization-token")
  return token
}

// ── Crear orden de envío ───────────────────────────────────────────────────────

/**
 * Registra el pedido como una orden de envío en Andreani.
 * @param {object} order — fila de la tabla `orders`
 * @returns {{ trackingCode: string }} — número de seguimiento de Andreani
 */
export async function createShipment(order) {
  if (!process.env.ANDREANI_CONTRATO) {
    throw new Error(
      "Andreani no configurado: falta ANDREANI_CONTRATO en las variables de entorno. " +
      "Contactar a apis@andreani.com para obtener el número de contrato."
    )
  }

  const token = await getToken()

  // Precio sin IVA (21%) para el valor declarado
  const totalSinIVA = Math.round(order.total / 1.21)

  const payload = {
    contrato: process.env.ANDREANI_CONTRATO,

    // ── Origen (ZetaPets) ────────────────────────────────────────
    origen: {
      codigoPostal: process.env.ANDREANI_REMITENTE_CP       || "",
      calle:        process.env.ANDREANI_REMITENTE_CALLE    || "ZetaPets",
      numero:       process.env.ANDREANI_REMITENTE_NUMERO   || "S/N",
      localidad:    process.env.ANDREANI_REMITENTE_LOCALIDAD || "",
      region:       process.env.ANDREANI_REMITENTE_REGION   || "Buenos Aires",
      pais:         "AR",
    },

    // ── Destino (cliente) ────────────────────────────────────────
    destino: {
      codigoPostal: order.shipping_postal_code || "",
      calle:        order.shipping_address     || "",
      numero:       "S/N",
      localidad:    order.shipping_city        || "",
      region:       "",
      pais:         "AR",
    },

    // ── Remitente ────────────────────────────────────────────────
    remitente: {
      nombreCompleto:  "ZetaPets",
      email:           process.env.GMAIL_USER || "zetapets.ar@gmail.com",
      documentoTipo:   "DNI",
      documentoNumero: "",
      telefonos: process.env.ANDREANI_REMITENTE_TELEFONO
        ? [{ tipo: "FIJO", numero: process.env.ANDREANI_REMITENTE_TELEFONO }]
        : [],
    },

    // ── Destinatario ─────────────────────────────────────────────
    destinatario: [
      {
        nombreCompleto:  order.shipping_name  || "",
        email:           order.shipping_email || "",
        documentoTipo:   "DNI",
        documentoNumero: "",
        telefonos: order.shipping_phone
          ? [{ tipo: "MOVIL", numero: order.shipping_phone }]
          : [],
      },
    ],

    productoAEntregar: `Pedido ZetaPets ${order.order_number}`,

    // ── Paquete ──────────────────────────────────────────────────
    bultos: [
      {
        kilos:                        1,     // peso en kg — ajustar según producto
        largoCm:                      30,
        altoCm:                       15,
        anchoCm:                      25,
        volumenCm:                    11250,
        valorDeclaradoSinImpuestos:   totalSinIVA,
        valorDeclaradoConImpuestos:   Math.round(order.total),
        referencias: [
          { detalle: `Pedido ${order.order_number}`, idCliente: order.id },
        ],
      },
    ],
  }

  const res = await fetch(`${BASE_URL}/v2/ordenes-de-envio`, {
    method:  "POST",
    headers: {
      "Content-Type":          "application/json",
      "x-authorization-token": token,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Andreani: error al crear orden (${res.status}) — ${body}`)
  }

  const data = await res.json()

  // Andreani devuelve el número de orden en el campo numeroAndreani
  const trackingCode = data.numeroAndreani ?? data.numero ?? data.id
  if (!trackingCode) {
    throw new Error(`Andreani: respuesta sin número de seguimiento. Respuesta: ${JSON.stringify(data)}`)
  }

  return { trackingCode }
}

// ── Descargar etiqueta PDF ────────────────────────────────────────────────────

/**
 * Descarga la etiqueta oficial de Andreani como PDF.
 * @param {string} trackingCode — número de orden Andreani
 * @returns {ArrayBuffer} — PDF binario
 */
export async function downloadLabel(trackingCode) {
  const token = await getToken()

  const res = await fetch(
    `${BASE_URL}/v2/ordenes-de-envio/${trackingCode}/etiquetas?tipo=ETIQUETA_ESTANDAR`,
    {
      headers: {
        "x-authorization-token": token,
        "Accept":                "application/pdf",
      },
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Andreani: error al descargar etiqueta (${res.status}) — ${body}`)
  }

  return res.arrayBuffer()
}
