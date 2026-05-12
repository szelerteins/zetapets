"use client"

import Link from "next/link"
import { useCart } from "../context/CartContext"
import { FREE_SHIPPING_THRESHOLD } from "../lib/shipping-zones"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function CheckoutSummary() {
  const { totalItems, totalPrice } = useCart()

  return (
    <div className="checkout-summary">
      <h3>Resumen del pedido</h3>

      <div className="summary-line">
        <span>Productos ({totalItems})</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      <div className="summary-line">
        <span>Envío</span>
        <span style={{ color: totalPrice >= FREE_SHIPPING_THRESHOLD ? "var(--verde-dark)" : "inherit", fontWeight: totalPrice >= FREE_SHIPPING_THRESHOLD ? 700 : 400 }}>
          {totalPrice >= FREE_SHIPPING_THRESHOLD ? "Gratis" : "Según tu CP"}
        </span>
      </div>

      <Link
        href="/checkout"
        className="btn btn-green"
        style={{ width: "100%", marginTop: "20px", justifyContent: "center" }}
      >
        Finalizar compra →
      </Link>

      {totalPrice < FREE_SHIPPING_THRESHOLD && (
        <p style={{ marginTop: "12px", fontSize: "0.82rem", color: "var(--celeste-dark)", textAlign: "center" }}>
          Agregá {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} más para envío gratis
        </p>
      )}
    </div>
  )
}
