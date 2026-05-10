"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { products } from "../../../data/products"
import { useCart } from "../../../context/CartContext"
import {
  MdOutlineShoppingCart, MdLocalShipping, MdOutlineLock,
  MdOutlineArrowBack, MdOutlineCheckCircle, MdOutlineSwapHoriz,
  MdOutlineSpa, MdOutlineSportsEsports, MdOutlineRestaurant,
  MdOutlineDirectionsWalk, MdOutlineDevices, MdOutlineBuild,
  MdOutlineStyle, MdPets, MdOutlineCategory,
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

const cardGradients = [
  "linear-gradient(135deg, #e8f7fd 0%, #b3e5fc 100%)",
  "linear-gradient(135deg, #edf7e5 0%, #c8e6c9 100%)",
  "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
  "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
  "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
  "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)",
  "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
]

const badgeClass = {
  Nuevo: "nuevo", Popular: "popular",
  Destacado: "destacado", Pro: "pro", Oferta: "oferta",
}

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function ProductoDetalle() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart } = useCart()

  const product = products.find((p) => p.id === Number(id))

  const [selected, setSelected] = useState(
    product?.variants ? product.variants[0] : null
  )
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px" }}>
        <MdOutlineCategory size={56} style={{ color: "var(--text-light)", marginBottom: 16 }} />
        <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Producto no encontrado</h2>
        <Link href="/productos" className="btn btn-primary">Ver todos los productos</Link>
      </div>
    )
  }

  const gradient = cardGradients[product.id % cardGradients.length]
  const CategoryIcon = CATEGORY_ICONS[product.category] || MdOutlineCategory
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3)

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      addToCart(product, selected)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function changeQty(delta) {
    setQty((q) => Math.max(1, q + delta))
  }

  return (
    <div className="product-detail-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="product-detail-breadcrumb">
          <Link href="/">Inicio</Link>
          <span>/</span>
          <Link href="/productos">Productos</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Main content */}
        <div className="product-detail-grid">

          {/* Imagen */}
          <div
            className="product-detail-img"
            style={!product.image ? { background: gradient } : {}}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <CategoryIcon size={80} className="product-detail-emoji" style={{ opacity: 0.55 }} />
            )}
            {product.badge && (
              <span className={`product-badge ${badgeClass[product.badge] || ""}`}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <p className="product-detail-category">
              <CategoryIcon size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              {product.category}
            </p>
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-desc">{product.description}</p>

            <p className="product-detail-price">{formatPrice(product.price)}</p>

            {/* Variantes */}
            {product.variants && (
              <div className="product-detail-variants">
                <p className="product-detail-variants-label">
                  Variante: <strong>{selected}</strong>
                </p>
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
              </div>
            )}

            {/* Selector de cantidad */}
            <div className="product-detail-qty">
              <span className="product-detail-qty-label">Cantidad:</span>
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => changeQty(-1)}
                  aria-label="Disminuir cantidad"
                  disabled={qty <= 1}
                >
                  −
                </button>
                <span className="qty-value">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => changeQty(1)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="product-detail-actions">
              <button
                className={`btn btn-lg ${added ? "btn-green" : "btn-primary"}`}
                onClick={handleAdd}
                style={{ transition: "all 0.3s ease", flex: 1 }}
              >
                {added ? (
                  <><MdOutlineCheckCircle size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />¡Agregado al carrito!</>
                ) : (
                  <><MdOutlineShoppingCart size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />Agregar al carrito</>
                )}
              </button>
            </div>

            <Link href="/productos" className="btn btn-outline" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <MdOutlineArrowBack size={16} />
              Volver a productos
            </Link>

            {/* Garantías */}
            <div className="product-detail-perks">
              <div className="product-detail-perk">
                <MdLocalShipping size={18} />
                <span>Envío gratis desde $60.000</span>
              </div>
              <div className="product-detail-perk">
                <MdOutlineLock size={18} />
                <span>Compra 100% protegida</span>
              </div>
              <div className="product-detail-perk">
                <MdOutlineSwapHoriz size={18} />
                <span>Cambios y devoluciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div className="product-detail-related">
            <h2 className="product-detail-related-title">También te puede interesar</h2>
            <div className="product-detail-related-grid">
              {related.map((p) => {
                const g = cardGradients[p.id % cardGradients.length]
                const RelIcon = CATEGORY_ICONS[p.category] || MdOutlineCategory
                return (
                  <Link key={p.id} href={`/productos/${p.id}`} className="product-detail-related-card">
                    <div
                      className="product-detail-related-img"
                      style={!p.image ? { background: g } : {}}
                    >
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} sizes="200px" />
                      ) : (
                        <RelIcon size={32} style={{ opacity: 0.55 }} />
                      )}
                    </div>
                    <p className="product-detail-related-name">{p.name}</p>
                    <p className="product-detail-related-price">{formatPrice(p.price)}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
