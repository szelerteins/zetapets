"use client"

import { useState } from "react"
import Image from "next/image"
import { useCart } from "../context/CartContext"

const badgeClass = {
  Nuevo: "nuevo",
  Popular: "popular",
  Destacado: "destacado",
  Pro: "pro",
  Oferta: "oferta",
}

const cardGradients = [
  "linear-gradient(135deg, #e8f7fd 0%, #b3e5fc 100%)",
  "linear-gradient(135deg, #edf7e5 0%, #c8e6c9 100%)",
  "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
  "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
  "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
  "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)",
  "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
]

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [selected, setSelected] = useState(
    product.variants ? product.variants[0] : null
  )
  const [added, setAdded] = useState(false)

  const gradient = cardGradients[product.id % cardGradients.length]

  function handleAdd() {
    addToCart(product, selected)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="product-card">
      <div className="product-image" style={!product.image ? { background: gradient } : {}}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span className="product-emoji">{product.emoji}</span>
        )}
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
          <button
            className={`btn btn-sm ${added ? "btn-green" : "btn-primary"}`}
            onClick={handleAdd}
            style={{ transition: "all 0.3s ease" }}
          >
            {added ? "✓ Agregado" : "+ Agregar"}
          </button>
        </div>
      </div>
    </article>
  )
}
