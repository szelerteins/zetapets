"use client"

import { useState } from "react"
import { useCart } from "../context/CartContext"

const badgeClass = {
  Nuevo: "nuevo",
  Popular: "popular",
  Destacado: "destacado",
  Pro: "pro",
  Oferta: "oferta",
}

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [selected, setSelected] = useState(
    product.variants ? product.variants[0] : null
  )

  function handleAdd() {
    addToCart(product, selected)
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <span>{product.emoji}</span>
        {product.badge && (
          <span className={`product-badge ${badgeClass[product.badge] || ""}`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        {product.variants && (
          <div className="product-variants">
            {product.variants.map((v) => (
              <button
                key={v}
                className={`variant-chip ${selected === v ? "selected" : ""}`}
                onClick={() => setSelected(v)}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            + Agregar
          </button>
        </div>
      </div>
    </article>
  )
}
