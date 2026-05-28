"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
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

function strHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function ProductoDetalleClient({ product, related = [] }) {
  const { addToCart } = useCart()

  const mainImage = product.images?.[0] || product.image_url
  const [activeImage, setActiveImage] = useState(mainImage)
  const allImages = product.images?.length ? product.images : (product.image_url ? [product.image_url] : [])

  const [selected, setSelected] = useState(
    product.variants?.length ? product.variants[0] : null
  )
  const [selectedColor, setSelectedColor] = useState(
    product.color_variants?.length ? product.color_variants[0] : null
  )
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const gradient = cardGradients[strHash(String(product.id)) % cardGradients.length]
  const CategoryIcon = CATEGORY_ICONS[product.category] || MdOutlineCategory

  const activeFeatures = (product.features || []).filter(
    f => f && f.trim() && f !== "N/A" && !f.endsWith(": N/A")
  )

  const variantLabel = [selectedColor?.color, selected].filter(Boolean).join(" / ") || null

  function handleColorSelect(cv) {
    setSelectedColor(cv)
    if (cv.image_url) setActiveImage(cv.image_url)
  }

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      addToCart({ ...product, image: activeImage }, variantLabel)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
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

          {/* Imágenes */}
          <div className="product-detail-images">
            <div
              className="product-detail-img"
              style={!activeImage ? { background: gradient } : {}}
            >
              {activeImage ? (
                <Image
                  src={activeImage}
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

            {/* Miniaturas */}
            {allImages.length > 1 && (
              <div className="product-detail-thumbs">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`product-thumb-btn ${activeImage === img ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <Image src={img} alt={`Foto ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <p className="product-detail-category">
              <CategoryIcon size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              {product.category}
            </p>
            <h1 className="product-detail-name">{product.name}</h1>
            {product.description && (
              <p className="product-detail-desc">{product.description}</p>
            )}

            <p className="product-detail-price">{formatPrice(product.price)}</p>

            {/* Variantes de color */}
            {product.color_variants?.length > 0 && (
              <div className="product-detail-variants">
                <p className="product-detail-variants-label">
                  Color: <strong>{selectedColor?.color}</strong>
                </p>
                <div className="product-variants" style={{ gap: 8 }}>
                  {product.color_variants.map((cv) => (
                    <button
                      key={cv.color}
                      title={cv.color}
                      onClick={() => handleColorSelect(cv)}
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: cv.hex || "#ccc",
                        border: selectedColor?.color === cv.color ? "3px solid var(--primary)" : "2px solid #ddd",
                        cursor: "pointer", padding: 0, flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Variantes de talle */}
            {product.variants?.length > 0 && (
              <div className="product-detail-variants">
                <p className="product-detail-variants-label">
                  Talle: <strong>{selected}</strong>
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

            {/* Cantidad */}
            <div className="product-detail-qty">
              <span className="product-detail-qty-label">Cantidad:</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>

            {/* Botón agregar */}
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

        {/* Características técnicas */}
        {activeFeatures.length > 0 && (
          <div className="product-detail-features">
            <h2 className="product-detail-features-title">Características</h2>
            <div className="product-features-table">
              {activeFeatures.map((feat, i) => {
                const parts = feat.split(": ")
                const label = parts[0]
                const value = parts.slice(1).join(": ")
                return (
                  <div key={i} className={`product-feature-row ${i % 2 === 0 ? "even" : "odd"}`}>
                    <span className="product-feature-label">{label}</span>
                    <span className="product-feature-value">{value || feat}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div className="product-detail-related">
            <h2 className="product-detail-related-title">También te puede interesar</h2>
            <div className="product-detail-related-grid">
              {related.map((p) => {
                const g = cardGradients[strHash(String(p.id)) % cardGradients.length]
                const RelIcon = CATEGORY_ICONS[p.category] || MdOutlineCategory
                const img = p.images?.[0] || p.image_url
                return (
                  <Link key={p.id} href={`/productos/${p.id}`} className="product-detail-related-card">
                    <div className="product-detail-related-img" style={!img ? { background: g } : {}}>
                      {img ? (
                        <Image src={img} alt={p.name} fill style={{ objectFit: "cover" }} sizes="200px" />
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
