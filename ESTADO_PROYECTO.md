# ZetaPets — Estado del proyecto

Última actualización: 2026-05-11

---

## Stack

- **Frontend / Backend:** Next.js 15 (App Router) — `npm run dev` en puerto 3003
- **Base de datos:** Supabase (PostgreSQL) — proyecto `lqkbunxkkwiyvbeaktuq`
- **Pagos:** MercadoPago Checkout Pro (producción)
- **Emails:** Nodemailer + Gmail SMTP (`zetapets.ar@gmail.com`)
- **Deploy:** Vercel — se deploya automáticamente al hacer push a `main` en GitHub (`szelerteins/zetapets`)
- **Etiquetas de envío:** Andreani REST API (implementado, pendiente credenciales)

---

## Variables de entorno

Están en `.env.local` (local) y en Vercel Dashboard (producción).

| Variable | Descripción |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de producción de MercadoPago |
| `NEXT_PUBLIC_APP_URL` | URL pública (`https://zetapets.vercel.app` en prod, `http://localhost:3003` en local) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lqkbunxkkwiyvbeaktuq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service_role (bypasea RLS, solo server) |
| `GMAIL_USER` | `zetapets.ar@gmail.com` |
| `GMAIL_APP_PASSWORD` | App Password de Gmail (no es la contraseña de la cuenta) |
| `ANDREANI_USUARIO` | **Pendiente** — contactar apis@andreani.com |
| `ANDREANI_CONTRASENA` | **Pendiente** — contactar apis@andreani.com |
| `ANDREANI_CONTRATO` | **Pendiente** — número de contrato Andreani |
| `ANDREANI_TEST_MODE` | `true` para QA, `false` para producción |
| `ANDREANI_REMITENTE_*` | Datos de dirección del depósito/local |

---

## Lo que está implementado y funcionando

### Tienda
- [x] Catálogo de productos con filtros por categoría
- [x] Carrito (drawer lateral, persistencia en localStorage)
- [x] Cálculo de envío por código postal (zonas en `lib/shipping-zones.js`)
  - CABA (1000–1499): $3.500
  - GBA (1500–2999): $4.500
  - Interior (3000–9999): $6.500
  - Envío gratis desde $80.000
- [x] Checkout con 2 pasos: datos de envío + resumen
- [x] Opción retiro en local (Villa Crespo, CABA)
- [x] Integración MercadoPago Checkout Pro (pago real)
- [x] Página de confirmación (`/confirmacion`) con estado approved / pending / failure
- [x] Email de confirmación automático al cliente tras el pago

### Base de datos (Supabase)
Tablas: `profiles`, `admin_users`, `products`, `orders`, `order_items`

Columnas relevantes en `orders`:
- `status`: pending | confirmed | shipped | delivered | cancelled
- `payment_status`: pending | paid | failed
- `mercadopago_payment_id`
- `delivery_method`: shipping | pickup
- `ca_tracking_code` — número de seguimiento Andreani (se llena al generar la etiqueta)
- `ca_shipment_at` — fecha en que se registró el envío

Migraciones aplicadas: 001 → 008

### Panel de administración (`/admin`)
Acceso: cookie `zetapets-session=authenticated` (se setea al ingresar la clave en `/admin`)

- [x] Dashboard con métricas (ventas, pedidos, clientes)
- [x] Tabla de pedidos con filtros por estado
- [x] Cambio de estado de pedido inline (select)
- [x] Columna de tracking (se llena automáticamente al generar etiqueta)
- [x] Botón "Etiqueta CA" — genera orden en Andreani y descarga PDF oficial

---

## Lo que falta / está pendiente

### Inmediato — requiere acción externa

- [ ] **Credenciales Andreani** — mandar mail a `apis@andreani.com` pidiendo acceso a la API.
  Una vez recibidas, cargar en Vercel: `ANDREANI_USUARIO`, `ANDREANI_CONTRASENA`, `ANDREANI_CONTRATO` y los datos del remitente.
  El código ya está listo en `lib/andreani.js` y `app/api/admin/orders/[id]/label/route.js`.

### Mejoras planeadas

- [ ] **Profesionalizar el panel de administrador**
  - Más gráficos, mejor diseño general
  - Gestión de productos desde el panel (editar stock, precios, imágenes)
  - Vista de detalle de cada pedido

- [ ] **Facturador automático**
  - Generar factura PDF al confirmar el pago
  - Opciones: integración con AFIP (requiere CUIT + certificado), o factura simplificada propia

- [ ] **Enlazar Excel con la página**
  - Exportar pedidos a `.xlsx` desde el panel admin
  - O importar/actualizar productos desde un Excel

- [ ] **Botón "Consultar" feo en mobile** (Hero)
  - Revisar estilos del botón en `components/Hero.jsx` para pantallas chicas
  - El problema está en el layout del hero en viewport < 480px

- [ ] **Emails a spam**
  - Configurar SPF/DKIM para `zetapets.ar@gmail.com`
  - O migrar a un proveedor transaccional (Resend, SendGrid) para mejor entrega

---

## Flujo de pago completo

```
Cliente → Checkout → POST /api/payments/create-preference
  → Crea orden "pending" en Supabase
  → Crea Preference en MercadoPago
  → Redirige a MercadoPago

Cliente paga en MercadoPago
  → Webhook: POST /api/payments/webhook
      → Actualiza orden a status=confirmed, payment_status=paid
      → Envía email de confirmación al cliente
  → Redirección: /confirmacion?status=approved&order_id=UUID
      → Muestra resumen del pedido
```

## Flujo de etiqueta (cuando Andreani esté configurado)

```
Admin en /admin/dashboard/ventas
  → Click "Etiqueta CA" en un pedido
  → GET /api/admin/orders/{id}/label
      → Si no tiene tracking: crea orden en Andreani, guarda ca_tracking_code, avanza status a "shipped"
      → Si ya tiene tracking: descarga la etiqueta existente
  → Devuelve PDF oficial de Andreani listo para imprimir
```

---

## Archivos clave

| Archivo | Qué hace |
|---|---|
| `lib/andreani.js` | Cliente Andreani: auth, crear orden, descargar etiqueta |
| `lib/mercadopago.js` | Cliente MercadoPago |
| `lib/shipping-zones.js` | Zonas de envío y función `getShippingCost()` |
| `lib/email-templates.js` | Template HTML del email de confirmación |
| `lib/supabase/admin.js` | Cliente Supabase con service_role (solo server) |
| `app/api/payments/create-preference/route.js` | Crea la Preference en MP + guarda orden pending |
| `app/api/payments/webhook/route.js` | Recibe notificación de MP, confirma pago, envía email |
| `app/api/admin/orders/route.js` | GET todos los pedidos / PATCH cambiar estado |
| `app/api/admin/orders/[id]/label/route.js` | Genera/descarga etiqueta Andreani |
| `components/admin/OrdersTable.jsx` | Tabla de pedidos del panel admin |
| `components/CheckoutSteps.jsx` | Formulario de checkout (2 pasos) |
| `components/OrderConfirmation.jsx` | Página post-pago |
| `components/WhatsAppButton.jsx` | Botón flotante de WhatsApp |
