"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR")
}

function formatDate(str) {
  return new Date(str).toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  })
}

export default function OrderConfirmation() {
  const params  = useSearchParams()
  const status  = params.get("status")
  const orderId = params.get("order_id")

  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(!!orderId)

  useEffect(() => {
    if (!orderId) return
    fetch(`/api/orders/${orderId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setOrder(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ fontSize: "2rem" }}>⏳</p>
        <p style={{ color: "#64748b", marginTop: "12px" }}>Cargando tu pedido…</p>
      </div>
    )
  }

  if (status === "failure") {
    return (
      <div style={{ maxWidth: "520px", margin: "60px auto", textAlign: "center" }}>
        <p style={{ fontSize: "3.5rem" }}>❌</p>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#dc2626", margin: "16px 0 8px" }}>
          El pago no fue procesado
        </h1>
        <p style={{ color: "#64748b", marginBottom: "32px" }}>
          Podés intentarlo nuevamente o contactarnos si el problema persiste.
        </p>
        <Link href="/checkout" className="btn btn-primary">Volver al checkout</Link>
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div style={{ maxWidth: "520px", margin: "60px auto", textAlign: "center" }}>
        <p style={{ fontSize: "3.5rem" }}>⏳</p>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#d97706", margin: "16px 0 8px" }}>
          Pago pendiente de acreditación
        </h1>
        <p style={{ color: "#64748b", marginBottom: "16px" }}>
          Tu pedido fue recibido. Te avisaremos por email cuando el pago sea confirmado.
        </p>
        {order?.order_number && (
          <p style={{ background: "#fef9c3", borderRadius: "8px", padding: "10px 16px", display: "inline-block", fontWeight: 700, color: "#92400e" }}>
            N° pedido: {order.order_number}
          </p>
        )}
        <div style={{ marginTop: "32px" }}>
          <Link href="/productos" className="btn btn-outline">Ver productos</Link>
        </div>
      </div>
    )
  }

  // approved
  return (
    <div style={{ maxWidth: "560px", margin: "48px auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <p style={{ fontSize: "3.5rem" }}>✅</p>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#16a34a", margin: "12px 0 8px" }}>
          ¡Compra confirmada!
        </h1>
        <p style={{ color: "#475569" }}>Gracias por tu compra. Te enviamos los detalles por email.</p>
      </div>

      {order && (
        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>N° de pedido</p>
              <p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: "1.05rem" }}>{order.order_number}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fecha</p>
              <p style={{ margin: "2px 0 0", fontWeight: 600, fontSize: "0.9rem" }}>{formatDate(order.created_at)}</p>
            </div>
          </div>

          {order.order_items?.length > 0 && (
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginBottom: "16px" }}>
              {order.order_items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "0.9rem", color: "#334155" }}>
                  <span>
                    {item.product_emoji && `${item.product_emoji} `}
                    {item.product_name}
                    {item.variant ? ` (${item.variant})` : ""}
                    {" "}×{item.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>{formatPrice(item.total_price)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.05rem" }}>
            <span>Total pagado</span>
            <span style={{ color: "var(--celeste-dark)" }}>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div style={{
        background: order?.delivery_method === "pickup" ? "#f0fdf4" : "#eff6ff",
        border: `1px solid ${order?.delivery_method === "pickup" ? "#bbf7d0" : "#bfdbfe"}`,
        borderRadius: "10px", padding: "16px 20px", marginBottom: "28px", fontSize: "0.9rem",
      }}>
        {order?.delivery_method === "pickup" ? (
          <>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#166534" }}>🏪 Retiro en local — Villa Crespo, CABA</p>
            <p style={{ margin: 0, color: "#15803d" }}>Te vamos a confirmar la dirección exacta por email.</p>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#1d4ed8" }}>📦 Tu pedido será enviado a:</p>
            <p style={{ margin: 0, color: "#334155" }}>
              {order?.shipping_name}<br />
              {order?.shipping_address}{order?.shipping_city ? `, ${order.shipping_city}` : ""}<br />
              {order?.shipping_postal_code ? `CP ${order.shipping_postal_code}` : ""}
            </p>
          </>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/productos" className="btn btn-primary">Seguir comprando</Link>
      </div>
    </div>
  )
}
