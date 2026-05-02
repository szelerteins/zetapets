"use client"

import Link from "next/link"
import { useCart } from "../context/CartContext"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function CheckoutSummary() {
  const { totalItems, totalPrice } = useCart()

  const shipping = totalPrice >= 30000 ? 0 : 2990
  const total = totalPrice + shipping

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

      <Link
        href="/checkout"
        className="btn btn-green"
        style={{ width: "100%", marginTop: "20px", justifyContent: "center" }}
      >
        Finalizar compra →
      </Link>

      {totalPrice < 30000 && (
        <p style={{ marginTop: "12px", fontSize: "0.82rem", color: "var(--celeste-dark)", textAlign: "center" }}>
          Agregá {formatPrice(30000 - totalPrice)} más para envío gratis 🎁
        </p>
      )}
    </div>
  )
}
