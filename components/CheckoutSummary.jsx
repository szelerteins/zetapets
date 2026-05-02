"use client"

import { useState } from "react"
import { useCart } from "../context/CartContext"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function CheckoutSummary() {
  const { totalItems, totalPrice, clearCart } = useCart()
  const [msg, setMsg] = useState(false)

  const shipping = totalPrice >= 30000 ? 0 : 2990
  const total = totalPrice + shipping

  function handleCheckout() {
    setMsg(true)
  }

  function handleClear() {
    clearCart()
    setMsg(false)
  }

  return (
    <div className="checkout-summary">
      <h3>Resumen del pedido</h3>

      <div className="summary-line">
        <span>Productos ({totalItems})</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      <div className="summary-line">
        <span>Envío</span>
        <span style={{ color: shipping === 0 ? "var(--verde-dark)" : "inherit", fontWeight: shipping === 0 ? 700 : 400 }}>
          {shipping === 0 ? "Gratis" : formatPrice(shipping)}
        </span>
      </div>
      <div className="summary-line total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {!msg ? (
        <button
          className="btn btn-green"
          style={{ width: "100%", marginTop: "20px", justifyContent: "center" }}
          onClick={handleCheckout}
        >
          Finalizar compra →
        </button>
      ) : (
        <>
          <div
            className="checkout-msg"
            style={{ display: "block", marginTop: "16px" }}
          >
            🚀 Funcionalidad de pago próximamente disponible. ¡Gracias por tu interés!
          </div>
          <button
            className="btn btn-outline"
            style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}
            onClick={handleClear}
          >
            Vaciar carrito
          </button>
        </>
      )}

      {totalPrice < 30000 && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "0.82rem",
            color: "var(--celeste-dark)",
            textAlign: "center",
          }}
        >
          Agregá {formatPrice(30000 - totalPrice)} más para envío gratis 🎁
        </p>
      )}
    </div>
  )
}
