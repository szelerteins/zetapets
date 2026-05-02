"use client"

import Link from "next/link"
import { useCart } from "../context/CartContext"

const TRACKING_STEPS = [
  { label: "Pedido confirmado", icon: "✅", desc: "Tu pedido fue recibido con éxito" },
  { label: "Preparando pedido", icon: "📦", desc: "Estamos preparando tus productos" },
  { label: "Enviado", icon: "🚚", desc: "El paquete salió de nuestro depósito" },
  { label: "En camino", icon: "📍", desc: "Tu pedido está cerca de vos" },
  { label: "Entregado", icon: "🎉", desc: "¡Tu pedido llegó!" },
]

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  })
}

export default function OrderConfirmation() {
  const { lastOrder } = useCart()

  if (!lastOrder) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ fontSize: "3rem" }}>📋</p>
        <p style={{ fontWeight: 700, marginTop: "16px", fontSize: "1.2rem" }}>
          No hay ninguna orden reciente
        </p>
        <Link href="/productos" className="btn btn-primary" style={{ marginTop: "24px", display: "inline-flex" }}>
          Ir a productos
        </Link>
      </div>
    )
  }

  const currentStep = 1

  return (
    <div className="order-confirmation">

      {/* Header de éxito */}
      <div className="order-success-header">
        <div className="order-success-icon">🎉</div>
        <h1>¡Compra realizada con éxito!</h1>
        <p>Gracias <strong>{lastOrder.userData?.nombre}</strong>, tu pedido está en camino.</p>
        <div className="order-number-badge">
          Orden #{lastOrder.orderNumber}
        </div>
        <p className="order-date">Realizada el {formatDate(lastOrder.date)}</p>
      </div>

      <div className="order-body">

        {/* Timeline de tracking */}
        <div className="order-card">
          <h2 className="order-card-title">Estado de tu envío</h2>
          <div className="tracking-timeline">
            {TRACKING_STEPS.map((s, i) => {
              const isDone = i < currentStep
              const isCurrent = i === currentStep
              const isPending = i > currentStep
              return (
                <div key={i} className={`track-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""} ${isPending ? "pending" : ""}`}>
                  <div className="track-left">
                    <div className="track-circle">
                      <span>{s.icon}</span>
                    </div>
                    {i < TRACKING_STEPS.length - 1 && (
                      <div className={`track-line ${isDone ? "done" : ""}`} />
                    )}
                  </div>
                  <div className="track-content">
                    <p className="track-label">{s.label}</p>
                    <p className="track-desc">{s.desc}</p>
                    {isCurrent && (
                      <span className="track-current-badge">Estado actual</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="order-card">
          <h2 className="order-card-title">Resumen del pedido</h2>
          <div className="order-items">
            {lastOrder.items?.map((item) => (
              <div key={item.cartKey} className="order-item">
                <span className="order-item-emoji">{item.emoji}</span>
                <div className="order-item-info">
                  <p className="order-item-name">{item.name}</p>
                  {item.selectedVariant && (
                    <p className="order-item-variant">Variante: {item.selectedVariant}</p>
                  )}
                </div>
                <div className="order-item-right">
                  <span className="order-item-qty">x{item.quantity}</span>
                  <span className="order-item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total-line">
            <span>Total pagado</span>
            <strong>{formatPrice(lastOrder.total)}</strong>
          </div>
        </div>

        {/* Datos del comprador */}
        <div className="order-card order-info-grid">
          <div>
            <h2 className="order-card-title">Datos de entrega</h2>
            <p>{lastOrder.userData?.nombre} {lastOrder.userData?.apellido}</p>
            <p>{lastOrder.userData?.email}</p>
            <p>{lastOrder.userData?.telefono}</p>
            <p>{lastOrder.userData?.direccion}, CP {lastOrder.userData?.codigoPostal}</p>
          </div>
          <div>
            <h2 className="order-card-title">Método de pago</h2>
            <p style={{ textTransform: "capitalize", fontWeight: 600 }}>
              {{
                tarjeta: "💳 Tarjeta de crédito/débito",
                transferencia: "🏦 Transferencia bancaria",
                mercadopago: "🟦 Mercado Pago",
              }[lastOrder.paymentMethod] || lastOrder.paymentMethod}
            </p>
          </div>
        </div>

        {/* CTA final */}
        <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
          <Link href="/productos" className="btn btn-primary btn-lg">
            Seguir comprando →
          </Link>
        </div>

      </div>
    </div>
  )
}
