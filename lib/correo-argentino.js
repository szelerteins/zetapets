/**
 * lib/correo-argentino.js — Cliente REST para el portal de integraciones de Correo Argentino
 *
 * VARIABLES DE ENTORNO REQUERIDAS (agregar en .env.local y Vercel):
 *
 *   CA_USUARIO          → usuario del portal (tintegraciones.correoargentino.com.ar)
 *   CA_CLAVE            → contraseña del portal
 *   CA_NUMERO_CLIENTE   → número de cliente asignado por CA al registrarse
 *   CA_PRODUCTO         → código de servicio: "EP" (Encomienda Prioritaria) o "EC" (Encomienda Clásica)
 *   CA_TEST_MODE        → "true" para usar el ambiente de pruebas de CA
 *
 * DATOS DEL REMITENTE (tu negocio — los completa el dueño de la tienda):
 *   CA_REMITENTE_NOMBRE
 *   CA_REMITENTE_CALLE
 *   CA_REMITENTE_NUMERO
 *   CA_REMITENTE_LOCALIDAD
 *   CA_REMITENTE_PROVINCIA
 *   CA_REMITENTE_CP
 *   CA_REMITENTE_TELEFONO
 *
 * Documentación detallada de la API y los códigos de producto:
 * https://tintegraciones.correoargentino.com.ar (menú "Documentación" dentro del portal)
 */

const BASE_URL =
  process.env.CA_TEST_MODE === "true"
    ? "https://testintegraciones.correoargentino.com.ar"
    : "https://integraciones.correoargentino.com.ar"

// ── Autenticación ─────────────────────────────────────────────────────────────

async function getToken() {
  const res = await fetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario: process.env.CA_USUARIO,
      clave:   process.env.CA_CLAVE,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Correo Argentino: error de autenticación (${res.status}) — ${body}`)
  }
  const data = await res.json()
  // El portal puede devolver "token" o "access_token" según la versión de la API
  const token = data.token ?? data.access_token
  if (!token) throw new Error("Correo Argentino: la respuesta de auth no contiene token")
  return token
}

// ── Crear envío en CA y obtener código de seguimiento ─────────────────────────

/**
 * Registra el pedido como un envío en CA.
 * @param {object} order — fila de la tabla `orders` con campos de envío
 * @returns {{ trackingCode: string, labelUrl: string|null }}
 */
export async function createShipment(order) {
  if (!process.env.CA_USUARIO || !process.env.CA_NUMERO_CLIENTE) {
    throw new Error("Correo Argentino no configurado: faltan CA_USUARIO o CA_NUMERO_CLIENTE en las variables de entorno")
  }

  const token = await getToken()

  const payload = {
    NumeroCliente: process.env.CA_NUMERO_CLIENTE,
    Envios: [
      {
        // ── Remitente (ZetaPets) ──────────────────────────────────────
        Remitente: {
          Nombre:       process.env.CA_REMITENTE_NOMBRE   || "ZetaPets",
          Calle:        process.env.CA_REMITENTE_CALLE    || "",
          Numero:       process.env.CA_REMITENTE_NUMERO   || "S/N",
          Localidad:    process.env.CA_REMITENTE_LOCALIDAD || "",
          Provincia:    process.env.CA_REMITENTE_PROVINCIA || "Buenos Aires",
          CodigoPostal: process.env.CA_REMITENTE_CP       || "",
          Telefono:     process.env.CA_REMITENTE_TELEFONO || "",
          Email:        process.env.GMAIL_USER            || "zetapets.ar@gmail.com",
        },

        // ── Destinatario (cliente) ────────────────────────────────────
        Destinatario: {
          Nombre:       order.shipping_name          || "",
          Calle:        order.shipping_address        || "",
          Numero:       "",
          Localidad:    order.shipping_city           || "",
          Provincia:    "",
          CodigoPostal: order.shipping_postal_code    || "",
          Telefono:     order.shipping_phone          || "",
          Email:        order.shipping_email          || "",
        },

        // ── Producto (servicio CA) ────────────────────────────────────
        // Códigos comunes: "EP" (Encomienda Prioritaria), "EC" (Clásica)
        // Verificar los disponibles para tu contrato en el portal de CA
        Producto: process.env.CA_PRODUCTO || "EP",

        // ── Piezas (paquetes) ─────────────────────────────────────────
        Piezas: [
          {
            Descripcion:     `Pedido ZetaPets ${order.order_number}`,
            Peso:            1,    // kg  — ajustar según peso real del paquete
            Alto:            15,   // cm
            Ancho:           25,   // cm
            Largo:           35,   // cm
            ValorDeclarado:  Math.round(order.total),
            Cantidad:        1,
          },
        ],
      },
    ],
  }

  const res = await fetch(`${BASE_URL}/api/v2/shipments`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Correo Argentino: error al crear envío (${res.status}) — ${body}`)
  }

  const data = await res.json()

  // La API puede devolver el tracking en distintos campos según la versión;
  // cubrimos los más comunes. Verificar en el portal cuál aplica.
  const trackingCode =
    data.pieza            ??
    data.Pieza            ??
    data.codigo           ??
    data.Envios?.[0]?.Pieza ??
    data.Envios?.[0]?.pieza ??
    null

  const labelUrl =
    data.etiqueta_url     ??
    data.urlEtiqueta      ??
    data.Envios?.[0]?.etiqueta_url ??
    null

  if (!trackingCode) {
    throw new Error(`Correo Argentino: la respuesta no incluye código de seguimiento. Respuesta: ${JSON.stringify(data)}`)
  }

  return { trackingCode, labelUrl }
}

// ── Descargar PDF de la etiqueta ──────────────────────────────────────────────

/**
 * Descarga el PDF oficial de CA para un código de tracking ya registrado.
 * @param {string} trackingCode
 * @returns {ArrayBuffer} — PDF binario listo para servir como respuesta HTTP
 */
export async function downloadLabel(trackingCode) {
  const token = await getToken()

  const res = await fetch(`${BASE_URL}/api/v2/labels/${trackingCode}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept":        "application/pdf",
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Correo Argentino: error al descargar etiqueta (${res.status}) — ${body}`)
  }

  return res.arrayBuffer()
}
