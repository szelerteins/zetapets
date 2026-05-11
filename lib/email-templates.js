function formatPrice(n) {
  return "$" + Math.round(n).toLocaleString("es-AR")
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

              <!-- Shipping info -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <h3 style="margin:0 0 8px;color:#166534;font-size:0.95rem;">📦 Datos de envío</h3>
                <p style="margin:0;color:#15803d;line-height:1.6;">
                  ${order.shipping_name}<br/>
                  ${order.shipping_address}<br/>
                  CP: ${order.shipping_postal_code}
                  ${order.shipping_city ? `<br/>${order.shipping_city}` : ""}
                </p>
              </div>

              <!-- Next steps -->
              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;">
                <h3 style="margin:0 0 8px;color:#92400e;font-size:0.95rem;">⏱ Próximos pasos</h3>
                <p style="margin:0;color:#78350f;line-height:1.6;font-size:0.9rem;">
                  Tu pedido será preparado y despachado en las próximas 24-48 horas hábiles.
                  Te avisaremos cuando esté en camino.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:0.82rem;color:#94a3b8;">
                ¿Alguna consulta? Contactanos por WhatsApp o a
                <a href="mailto:zetapets.ar@gmail.com" style="color:#0ea5e9;">zetapets.ar@gmail.com</a>
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
