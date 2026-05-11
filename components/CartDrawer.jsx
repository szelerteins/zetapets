"use client"

import Link from "next/link"
import { useCart } from "../context/CartContext"
import CartItem from "./CartItem"
import { FREE_SHIPPING_THRESHOLD } from "../lib/shipping-zones"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function CartDrawer() {
  const { cart, totalItems, totalPrice, clearCart, setIsCartOpen } = useCart()

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />

      <aside className="cart-drawer">
        <div className="cart-header">
          <h2>🛒 Mi carrito ({totalItems})</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <p style={{ fontWeight: 600 }}>Tu carrito está vacío</p>
            <p style={{ fontSize: "0.87rem" }}>Agregá productos para empezar</p>
            <Link
              href="/productos"
              className="btn btn-primary btn-sm"
              onClick={() => setIsCartOpen(false)}
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <CartItem key={item.cartKey} item={item} />
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Envío</span>
                  <span style={{ color: "var(--verde-dark)", fontWeight: 600 }}>
                    {totalPrice >= FREE_SHIPPING_THRESHOLD ? "Gratis 🎉" : "Según tu CP"}
                  </span>
                </div>
              </div>

              <Link
                href="/carrito"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setIsCartOpen(false)}
              >
                Ver carrito completo
              </Link>

              <button className="clear-cart-btn" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
