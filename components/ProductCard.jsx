"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "../context/CartContext"
import {
  MdOutlineSpa, MdOutlineSportsEsports, MdOutlineRestaurant,
  MdOutlineDirectionsWalk, MdOutlineDevices, MdOutlineBuild,
  MdOutlineStyle, MdPets, MdOutlineCategory, MdOutlineCheckCircle,
} from "react-icons/md"

const CATEGORY_ICONS = {
  Higiene:      MdOutlineSpa,
  Juguetes:     MdOutlineSportsEsports,
  Alimentación: MdOutlineRestaurant,
  Paseo:        MdOutlineDirectionsWalk,
  Tecnología:   MdOutlineDevices,
  Repuestos:    MdOutlineBuild,
  Accesorios:   MdOutlineStyle,
  Gatos:        MdPets,
}

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
  const CategoryIcon = CATEGORY_ICONS[product.category] || MdOutlineCategory

  function handleAdd(e) {
    e.preventDefault()
    addToCart(product, selected)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="product-card product-card--clickable">
      <Link href={`/productos/${product.id}`} className="product-card-link" aria-label={product.name}>
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
            <CategoryIcon size={52} className="product-category-icon" />
          )}
          {product.badge && (
            <span className={`product-badge ${badgeClass[product.badge] || ""}`}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <Link href={`/productos/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
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
            {added ? (
              <><MdOutlineCheckCircle size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Agregado</>
            ) : (
              "+ Agregar"
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
