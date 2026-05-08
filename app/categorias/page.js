"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { categories } from "../../data/categories"
import { products } from "../../data/products"
import ProductGrid from "../../components/ProductGrid"

function CategoriasContent() {
  const searchParams = useSearchParams()
  const [activeId, setActiveId] = useState(null)
  const productsSectionRef = useRef(null)

  useEffect(() => {
    const param = searchParams.get("cat")
    setActiveId(param || null)
  }, [searchParams])

  // Scroll suave a los productos cuando se selecciona una categoría
  useEffect(() => {
    if (activeId && productsSectionRef.current) {
      setTimeout(() => {
        productsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 80)
    }
  }, [activeId])

  const activeCat = categories.find((c) => c.id === activeId)
  const filtered = activeId
    ? products.filter(
        (p) => p.category.toLowerCase() === (activeCat?.name.toLowerCase() ?? "")
      )
    : []

  function handleSelect(catId) {
    setActiveId((prev) => (prev === catId ? null : catId))
  }

  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container">

        {/* ── Instrucción visible ──────────────────────────────────── */}
        <p style={{
          textAlign: "center",
          color: "var(--text-light)",
          fontSize: "0.95rem",
          marginBottom: "28px",
          fontWeight: 500,
        }}>
          Tocá una categoría para ver sus productos 👇
        </p>

        {/* ── Grid de categorías con fotos ─────────────────────────── */}
        <div className="categories-grid" style={{ marginBottom: activeId ? "48px" : "0" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-card category-card-photo${activeId === cat.id ? " category-card-active" : ""}`}
              onClick={() => handleSelect(cat.id)}
              aria-pressed={activeId === cat.id}
              aria-label={`Ver productos de ${cat.name}`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="category-card-overlay" />
              {activeId === cat.id && (
                <div className="category-card-check">✓</div>
              )}
              <div className="category-card-content">
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Flecha indicadora de scroll ──────────────────────────── */}
        {!activeId && (
          <div style={{ textAlign: "center", padding: "32px 0 0" }}>
            <span style={{ fontSize: "2rem", color: "var(--text-light)", opacity: 0.5 }}>↑</span>
            <p style={{ color: "var(--text-light)", fontSize: "0.9rem", marginTop: "6px" }}>
              Seleccioná una categoría para ver los productos
            </p>
          </div>
        )}

        {/* ── Sección de productos ──────────────────────────────────── */}
        {activeId && activeCat && (
          <div ref={productsSectionRef} className="cat-products-section">

            {/* Banner de categoría seleccionada */}
            <div className="cat-products-banner">
              <div className="cat-products-banner-img">
                <Image
                  src={activeCat.image}
                  alt={activeCat.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="80px"
                />
              </div>
              <div className="cat-products-banner-info">
                <h2>{activeCat.name}</h2>
                <p>
                  {filtered.length} producto{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                className="cat-products-close"
                onClick={() => setActiveId(null)}
                aria-label="Cerrar categoría"
              >
                ✕ Volver
              </button>
            </div>

            {/* Grid de productos o estado vacío */}
            {filtered.length > 0 ? (
              <ProductGrid products={filtered} />
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-light)" }}>
                <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📦</p>
                <p style={{ fontWeight: 600 }}>No hay productos en esta categoría todavía</p>
                <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>
                  Estamos trabajando para agregar más productos pronto.
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  )
}

export default function CategoriasPage() {
  return (
    <>
      <div className="page-header">
        <h1>Categorías</h1>
        <p>Explorá por tipo de producto</p>
      </div>
      <Suspense fallback={<div style={{ padding: "60px", textAlign: "center" }}>Cargando...</div>}>
        <CategoriasContent />
      </Suspense>
    </>
  )
}
