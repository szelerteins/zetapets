"use client"

import Link from "next/link"
import { useCart } from "../../context/CartContext"
import CheckoutSteps from "../../components/CheckoutSteps"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function CheckoutPage() {
  const { cart, totalPrice } = useCart()
  const shipping = totalPrice >= 30000 ? 0 : 2990

  return (
    <>
      <div className="page-header">
        <h1>Checkout</h1>
        <p>Completá tu compra en dos pasos rápidos</p>
      </div>

      <section style={{ padding: "48px 0 80px" }}>
        <div className="container">
          <div className="checkout-layout">

            {/* Formulario multistep */}
            <div className="checkout-main">
              <CheckoutSteps />
            </div>

            {/* Resumen lateral */}
            <aside className="checkout-aside">
              <div className="checkout-summary">
                <h3>Tu pedido</h3>
                <div className="checkout-aside-items">
                  {cart.map((item) => (
                    <div key={item.cartKey} className="checkout-aside-item">
                      <span className="checkout-aside-emoji">{item.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                        {item.selectedVariant && (
                          <p style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>{item.selectedVariant}</p>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="summary-line">
                    <span>Subtotal</span>
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
                    <span>{formatPrice(totalPrice + shipping)}</span>
                  </div>
                </div>

                <Link href="/carrito" className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}>
                  ← Editar carrito
                </Link>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </>
  )
}
