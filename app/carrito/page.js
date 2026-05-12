"use client"

import Link from "next/link"
import { useCart } from "../../context/CartContext"
import CheckoutSummary from "../../components/CheckoutSummary"
import { MdOutlineShoppingCart, MdOutlineDeleteOutline } from "react-icons/md"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function CarritoPage() {
  const { cart, updateQuantity, removeFromCart, totalItems } = useCart()

  return (
    <>
      <div className="page-header">
        <h1>Mi carrito</h1>
        <p>{totalItems} producto{totalItems !== 1 ? "s" : ""} seleccionado{totalItems !== 1 ? "s" : ""}</p>
      </div>

      <section className="cart-page">
        <div className="container">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <MdOutlineShoppingCart size={64} style={{ color: "var(--text-light)", margin: "0 auto 16px" }} />
              <h2 style={{ marginBottom: "12px" }}>Tu carrito está vacío</h2>
              <p style={{ color: "var(--text-light)", marginBottom: "28px" }}>
                Explorá nuestros productos y encontrá algo para tu mascota
              </p>
              <Link href="/productos" className="btn btn-primary btn-lg">
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="cart-page-grid">
              {/* Lista de items */}
              <div className="cart-page-items">
                {cart.map((item) => (
                  <article key={item.cartKey} className="cart-page-item">
                    <div className="cart-page-item-img">{item.emoji}</div>

                    <div className="cart-page-item-info">
                      <h3>{item.name}</h3>
                      {item.selectedVariant && (
                        <p>Variante: {item.selectedVariant}</p>
                      )}
                      <p style={{ color: "var(--celeste-dark)", fontWeight: 700, marginTop: "4px" }}>
                        {formatPrice(item.price)} c/u
                      </p>
                    </div>

                    <div className="cart-page-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.cartKey, -1)}
                        aria-label="Disminuir"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.cartKey, 1)}
                        aria-label="Aumentar"
                      >
                        +
                      </button>

                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "1rem",
                          minWidth: "80px",
                          textAlign: "right",
                        }}
                      >
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.cartKey)}
                        aria-label="Eliminar"
                      >
                        <MdOutlineDeleteOutline size={20} />
                      </button>
                    </div>
                  </article>
                ))}

                <Link
                  href="/productos"
                  className="btn btn-outline"
                  style={{ alignSelf: "flex-start" }}
                >
                  ← Seguir comprando
                </Link>
              </div>

              {/* Resumen */}
              <CheckoutSummary />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
