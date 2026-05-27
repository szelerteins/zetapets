function formatPrice(n) {
  return "$" + Math.round(n).toLocaleString("es-AR")
}

export function birthdayDiscountTemplate({ userName, petBirthday, discountPct = 10, couponCode, expiresAt }) {
  const parts = petBirthday.split("-").map(Number)
  const bDay  = new Date(2000, parts[1] - 1, parts[2])
  const dayStr = bDay.toLocaleDateString("es-AR", { day: "numeric", month: "long" })

  // expiresAt es el día DESPUÉS del cumpleaños; mostrar el cumpleaños como fecha límite
  const expDate    = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
  const validUntil = new Date(expDate)
  validUntil.setDate(validUntil.getDate() - 1)
  const expiresStr = validUntil.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>¡Cumpleaños de tu mascota! - ZetaPets</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#ec4899);padding:40px;text-align:center;">
              <p style="font-size:3rem;margin:0;">🎂</p>
              <h1 style="color:#ffffff;margin:8px 0 0;font-size:1.7rem;font-weight:800;">¡Cumpleaños de tu mascota!</h1>
              <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:1rem;">ZetaPets te tiene un regalo especial</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <h2 style="margin:0 0 12px;color:#1e293b;font-size:1.25rem;">
                ¡Hola, ${userName}! 🐾
              </h2>
              <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
                Se acerca el cumpleaños de tu mascota (<strong>${dayStr}</strong>) y en ZetaPets
                lo queremos celebrar con vos. Por eso, <strong>esta semana tenés un descuento
                especial en toda la tienda</strong>.
              </p>

              <!-- Discount badge -->
              <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:12px;padding:28px;margin-bottom:20px;text-align:center;">
                <p style="margin:0 0 6px;font-size:0.9rem;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Tu descuento especial de cumpleaños</p>
                <p style="margin:0;font-size:3.5rem;font-weight:900;color:#b45309;line-height:1;">${discountPct}%</p>
                <p style="margin:4px 0 0;font-size:1rem;color:#92400e;font-weight:600;">OFF en toda la tienda</p>
              </div>

              <!-- Coupon code box -->
              <div style="background:#ffffff;border:2px dashed #f59e0b;border-radius:12px;padding:22px;margin-bottom:24px;text-align:center;">
                <p style="margin:0 0 8px;font-size:0.85rem;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Tu código de descuento</p>
                <p style="margin:0;font-size:2.2rem;font-weight:900;color:#b45309;letter-spacing:0.15em;font-family:'Courier New',monospace;">${couponCode}</p>
                <p style="margin:10px 0 0;font-size:0.82rem;color:#78350f;">Válido hasta el ${expiresStr} · Un solo uso</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin:28px 0;">
                <a href="https://zetapets.vercel.app/productos" style="background:linear-gradient(135deg,#f59e0b,#ec4899);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:1rem;display:inline-block;">
                  Ir a la tienda →
                </a>
              </div>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;">
                <p style="margin:0;font-size:0.85rem;color:#166534;line-height:1.6;">
                  <strong>¿Cómo usar el descuento?</strong><br/>
                  1. Iniciá sesión con tu cuenta en zetapets.vercel.app<br/>
                  2. Agregá los productos al carrito<br/>
                  3. En el checkout, ingresá el código <strong>${couponCode}</strong> en el campo "¿Tenés un código de descuento?"<br/>
                  4. El ${discountPct}% se descuenta automáticamente al pagar
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:0.82rem;color:#94a3b8;">
                Recibís este email porque registraste el cumpleaños de tu mascota en ZetaPets.<br/>
                ¿Consultas? Escribinos a
                <a href="mailto:zetapetsmascotas@gmail.com" style="color:#f59e0b;">zetapetsmascotas@gmail.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:0.78rem;color:#cbd5e1;">
                ZetaPets · zetapets.vercel.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function orderConfirmationTemplate({ order, items }) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #f0f0f0;">
          ${item.product_emoji ? `<span style="font-size:1.3rem;margin-right:8px">${item.product_emoji}</span>` : ""}
          <strong>${item.product_name}</strong>
          ${item.variant ? `<span style="color:#666;font-size:0.9rem"> (${item.variant})</span>` : ""}
        </td>
        <td style="padding:10px 0;text-align:center;border-bottom:1px solid #f0f0f0;">×${item.quantity}</td>
        <td style="padding:10px 0;text-align:right;border-bottom:1px solid #f0f0f0;font-weight:600;">
          ${formatPrice(item.total_price)}
        </td>
      </tr>`
    )
    .join("")

  const shippingCost = order.total - order.subtotal
  const shippingLabel =
    shippingCost === 0
      ? '<span style="color:#22c55e;font-weight:700">Gratis</span>'
      : formatPrice(shippingCost)

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Pedido confirmado - ZetaPets</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:1.8rem;font-weight:800;">ZetaPets 🐾</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:1rem;">¡Tu pedido fue confirmado!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <h2 style="margin:0 0 8px;color:#1e293b;font-size:1.3rem;">
                ¡Hola, ${order.shipping_name}! 🎉
              </h2>
              <p style="margin:0 0 24px;color:#64748b;">
                Tu pago fue procesado con éxito. Acá está el resumen de tu pedido:
              </p>

              <!-- Order number badge -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px;text-align:center;">
                <p style="margin:0;font-size:0.85rem;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Número de orden</p>
                <p style="margin:4px 0 0;font-size:1.4rem;font-weight:800;color:#0ea5e9;letter-spacing:0.05em;">${order.order_number}</p>
              </div>

              <!-- Items -->
              <h3 style="margin:0 0 12px;color:#1e293b;font-size:1rem;">Productos</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                ${itemsHtml}
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:6px 0;color:#64748b;">Subtotal</td>
                  <td style="padding:6px 0;text-align:right;color:#64748b;">${formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;">Envío</td>
                  <td style="padding:6px 0;text-align:right;">${shippingLabel}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 6px;font-weight:700;color:#1e293b;font-size:1.1rem;border-top:2px solid #e2e8f0;">Total pagado</td>
                  <td style="padding:12px 0 6px;text-align:right;font-weight:800;color:#0ea5e9;font-size:1.1rem;border-top:2px solid #e2e8f0;">${formatPrice(order.total)}</td>
                </tr>
              </table>

              <!-- Shipping / Pickup info -->
              ${order.delivery_method === 'pickup' ? `
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <h3 style="margin:0 0 8px;color:#166534;font-size:0.95rem;">🏪 Retiro en local</h3>
                <p style="margin:0;color:#15803d;line-height:1.6;">
                  ${order.shipping_name}<br/>
                  Villa Crespo, CABA<br/>
                  Te confirmaremos la dirección exacta por email.
                </p>
              </div>
              ` : `
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <h3 style="margin:0 0 8px;color:#166534;font-size:0.95rem;">📦 Datos de envío</h3>
                <p style="margin:0;color:#15803d;line-height:1.6;">
                  ${order.shipping_name}<br/>
                  ${order.shipping_address || ''}<br/>
                  CP: ${order.shipping_postal_code || ''}
                  ${order.shipping_city ? '<br/>' + order.shipping_city : ""}
                </p>
              </div>
              `}

              <!-- Next steps -->
              ${order.delivery_method === 'pickup' ? `
              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;">
                <h3 style="margin:0 0 8px;color:#92400e;font-size:0.95rem;">⏱ Próximos pasos</h3>
                <p style="margin:0;color:#78350f;line-height:1.6;font-size:0.9rem;">
                  Tu pedido estará listo para retirar en las próximas 24-48 horas hábiles.
                  Te confirmaremos la dirección del local por email.
                </p>
              </div>
              ` : `
              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;">
                <h3 style="margin:0 0 8px;color:#92400e;font-size:0.95rem;">⏱ Próximos pasos</h3>
                <p style="margin:0;color:#78350f;line-height:1.6;font-size:0.9rem;">
                  Tu pedido será preparado y despachado en las próximas 24-48 horas hábiles.
                  Te avisaremos cuando esté en camino.
                </p>
              </div>
              `}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:0.82rem;color:#94a3b8;">
                ¿Alguna consulta? Contactanos por WhatsApp o a
                <a href="mailto:zetapetsmascotas@gmail.com" style="color:#0ea5e9;">zetapetsmascotas@gmail.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:0.78rem;color:#cbd5e1;">
                ZetaPets · zetapets.vercel.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
