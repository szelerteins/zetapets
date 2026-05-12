# ZetaPets — Estado del proyecto

Última actualización: 2026-05-11

---

## Stack

- **Frontend / Backend:** Next.js 15 (App Router) — `npm run dev` en puerto 3003
- **Base de datos:** Supabase (PostgreSQL) — proyecto `lqkbunxkkwiyvbeaktuq`
- **Pagos:** MercadoPago Checkout Pro (producción)
- **Emails:** Nodemailer + Gmail SMTP (`zetapets.ar@gmail.com`)
- **Deploy:** Vercel — se deploya automáticamente al hacer push a `main` en GitHub (`szelerteins/zetapets`)

---

## Variables de entorno

Están en `.env.local` (local) y en Vercel Dashboard (producción).

| Variable | Descripción |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de producción de MercadoPago |
| `NEXT_PUBLIC_APP_URL` | URL pública (`https://zetapets.vercel.app` en prod) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lqkbunxkkwiyvbeaktuq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service_role (bypasea RLS, solo server) |
| `GMAIL_USER` | `zetapets.ar@gmail.com` |
| `GMAIL_APP_PASSWORD` | App Password de Gmail (no es la contraseña de la cuenta) |

---

## Lo que está implementado y funcionando

- Catálogo de productos con filtros por categoría
- Carrito con persistencia en localStorage
- Cálculo de envío por código postal (zonas en `lib/shipping-zones.js`)
- Checkout con datos de envío + opción retiro en local
- Pago real con MercadoPago Checkout Pro
- Página de confirmación post-pago (`/confirmacion`)
- Email automático al cliente tras el pago
- Panel admin (`/admin`) con métricas, tabla de pedidos y cambio de estado

---

## Etiquetas de envío — QUÉ FALTA Y CÓMO HACERLO

### Situación actual
El botón "📦 PDF" en el panel de admin genera una etiqueta **visual propia** (jsPDF) que NO tiene código de barras válido para ningún carrier. No sirve para despachar en Correo Argentino ni Andreani.

### Por qué no está implementado todavía
Se investigó la API de ambos carriers:
- **Correo Argentino (MiCorreo API):** el endpoint de creación de envíos está marcado como *"pendiente de implementación"* en su documentación. No es posible generar etiquetas reales por API con ellos hoy.
- **Andreani:** tiene una API REST funcional, pero requiere credenciales que se obtienen contactando a su equipo.

### Cómo activar etiquetas reales con Andreani

**Paso 1 — Obtener credenciales**
Mandar un mail a `apis@andreani.com` con este texto (ya está redactado):

> Buenas tardes,
> Me contacto para solicitar credenciales de acceso a la API REST de Andreani para integrar el servicio de envíos en mi tienda online.
> **Datos del negocio:** ZetaPets · Venta de productos para mascotas · zetapets.vercel.app
> **Lo que necesito:** usuario, contraseña y número de contrato para usar los endpoints `/v2/ordenes-de-envio` y `/v2/ordenes-de-envio/{id}/etiquetas`, más acceso al ambiente de testing (QA).
> Saludos, [tu nombre]

Andreani suele responder en 1–3 días hábiles.

**Paso 2 — Implementar el código**
Una vez que tengas las credenciales, pedirle a Claude que implemente la integración. Tiene toda la información necesaria:

- **API base URL (prod):** `https://apis.andreani.com`
- **API base URL (test):** `https://apisqa.andreani.com`
- **Auth:** `POST /login` con Basic auth → respuesta trae `x-authorization-token` en el header
- **Crear orden:** `POST /v2/ordenes-de-envio` con body JSON (ver estructura abajo)
- **Descargar etiqueta:** `GET /v2/ordenes-de-envio/{numeroAndreani}/etiquetas?tipo=ETIQUETA_ESTANDAR`

**Estructura del body para crear una orden:**
```json
{
  "contrato": "TU_NUMERO_CONTRATO",
  "origen": {
    "codigoPostal": "CP_DEL_LOCAL",
    "calle": "CALLE_DEL_LOCAL",
    "numero": "NUMERO",
    "localidad": "LOCALIDAD",
    "region": "Buenos Aires",
    "pais": "AR"
  },
  "destino": {
    "codigoPostal": "order.shipping_postal_code",
    "calle": "order.shipping_address",
    "numero": "S/N",
    "localidad": "order.shipping_city",
    "region": "",
    "pais": "AR"
  },
  "remitente": {
    "nombreCompleto": "ZetaPets",
    "email": "zetapets.ar@gmail.com",
    "documentoTipo": "DNI",
    "documentoNumero": "",
    "telefonos": [{ "tipo": "FIJO", "numero": "TU_TELEFONO" }]
  },
  "destinatario": [{
    "nombreCompleto": "order.shipping_name",
    "email": "order.shipping_email",
    "documentoTipo": "DNI",
    "documentoNumero": "",
    "telefonos": [{ "tipo": "MOVIL", "numero": "order.shipping_phone" }]
  }],
  "productoAEntregar": "Productos para mascotas",
  "bultos": [{
    "kilos": 1,
    "largoCm": 30,
    "altoCm": 15,
    "anchoCm": 25,
    "volumenCm": 11250,
    "valorDeclaradoSinImpuestos": 1000,
    "valorDeclaradoConImpuestos": 1210,
    "referencias": [{ "detalle": "Pedido ZetaPets ORDER_NUMBER", "idCliente": "ORDER_UUID" }]
  }]
}
```

**Paso 3 — Variables de entorno a agregar en Vercel**
```
ANDREANI_USUARIO=       (el que te manda Andreani)
ANDREANI_CONTRASENA=    (la que te manda Andreani)
ANDREANI_CONTRATO=      (número de contrato, ej: 400006711)
ANDREANI_TEST_MODE=true (cambiar a false en producción)
ANDREANI_REMITENTE_CP=
ANDREANI_REMITENTE_CALLE=
ANDREANI_REMITENTE_NUMERO=
ANDREANI_REMITENTE_LOCALIDAD=
ANDREANI_REMITENTE_REGION=Buenos Aires
ANDREANI_REMITENTE_TELEFONO=
```

**Paso 4 — Migraciones SQL ya aplicadas**
Los campos `ca_tracking_code` y `ca_shipment_at` ya están en la tabla `orders` de Supabase. No hay que correr ninguna migración adicional.

---

## Otras mejoras pendientes

- **Profesionalizar el panel de administrador** — más gráficos, edición de productos, vista de detalle de pedido
- **Facturador automático** — PDF de factura al confirmar el pago; requiere definir si se usa AFIP o factura simplificada propia
- **Enlazar Excel con la página** — exportar pedidos a `.xlsx` desde el panel, o importar/actualizar productos desde Excel
- **Botón "Consultar" feo en mobile** — revisar estilos del hero en `components/Hero.jsx` para viewport < 480px
- **Emails a spam** — configurar SPF/DKIM o migrar a Resend/SendGrid para mejor entrega

---

## Archivos clave

| Archivo | Qué hace |
|---|---|
| `lib/mercadopago.js` | Cliente MercadoPago |
| `lib/shipping-zones.js` | Zonas de envío y función `getShippingCost()` |
| `lib/email-templates.js` | Template HTML del email de confirmación |
| `lib/supabase/admin.js` | Cliente Supabase con service_role (solo server) |
| `app/api/payments/create-preference/route.js` | Crea la Preference en MP + guarda orden pending |
| `app/api/payments/webhook/route.js` | Recibe notificación de MP, confirma pago, envía email |
| `app/api/admin/orders/route.js` | GET todos los pedidos / PATCH cambiar estado |
| `components/admin/OrdersTable.jsx` | Tabla de pedidos del panel admin |
| `components/CheckoutSteps.jsx` | Formulario de checkout (2 pasos) |
| `components/OrderConfirmation.jsx` | Página post-pago |
| `components/WhatsAppButton.jsx` | Botón flotante de WhatsApp |
