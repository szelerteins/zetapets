"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  MdOutlineHourglassFull,
  MdOutlineCancel,
  MdOutlineCheckCircle,
  MdOutlineStorefront,
  MdOutlineLocalShipping,
  MdOutlineMarkEmailUnread,
} from "react-icons/md"

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
        <MdOutlineHourglassFull size={48} style={{ color: "#94a3b8", margin: "0 auto" }} />
        <p style={{ color: "#64748b", marginTop: "12px" }}>Cargando tu pedido…</p>
      </div>
    )
  }

  if (status === "failure") {
    return (
      <div style={{ maxWidth: "520px", margin: "60px auto", textAlign: "center" }}>
        <MdOutlineCancel size={64} style={{ color: "#dc2626", margin: "0 auto" }} />
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
        <MdOutlineHourglassFull size={64} style={{ color: "#d97706", margin: "0 auto" }} />
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
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <MdOutlineCheckCircle size={64} style={{ color: "#16a34a", margin: "0 auto" }} />
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#16a34a", margin: "12px 0 8px" }}>
          ¡Compra confirmada!
        </h1>
        <p style={{ color: "#475569" }}>Gracias por tu compra. Te enviamos los detalles por email.</p>
      </div>

      {/* Aviso spam */}
      <div style={{
        background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px",
        padding: "14px 18px", marginBottom: "24px", display: "flex",
        alignItems: "flex-start", gap: "12px",
      }}>
        <MdOutlineMarkEmailUnread size={22} style={{ color: "#b45309", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: "#92400e", fontSize: "0.9rem" }}>
            Revisá tu correo
          </p>
          <p style={{ margin: "4px 0 0", color: "#78350f", fontSize: "0.85rem", lineHeight: 1.5 }}>
            Si no encontrás el mail de confirmación en tu bandeja de entrada, revisá la carpeta de{" "}
            <strong>correo no deseado o spam</strong>.
          </p>
        </div>
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
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#166534", display: "flex", alignItems: "center", gap: "8px" }}>
              <MdOutlineStorefront size={18} style={{ flexShrink: 0 }} />
              Retiro en local — Villa Crespo, CABA
            </p>
            <p style={{ margin: 0, color: "#15803d" }}>Te vamos a confirmar la dirección exacta por email.</p>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#1d4ed8", display: "flex", alignItems: "center", gap: "8px" }}>
              <MdOutlineLocalShipping size={18} style={{ flexShrink: 0 }} />
              Tu pedido será enviado a:
            </p>
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
