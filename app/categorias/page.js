"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { categories } from "../../data/categories"
import { products } from "../../data/products"
import ProductGrid from "../../components/ProductGrid"

function CategoriasContent() {
  const searchParams = useSearchParams()
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const param = searchParams.get("cat")
    setActiveId(param || null)
  }, [searchParams])

  const activeCat = categories.find((c) => c.id === activeId)
  const filtered = activeId
    ? products.filter(
        (p) => p.category.toLowerCase() === (activeCat?.name.toLowerCase() ?? "")
      )
    : null

  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container">
        <div className="categories-grid" style={{ marginBottom: "60px" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="category-card"
              style={{
                border: activeId === cat.id ? "2px solid var(--celeste)" : undefined,
                background: activeId === cat.id ? "var(--celeste-light)" : undefined,
              }}
              onClick={() => setActiveId(activeId === cat.id ? null : cat.id)}
            >
              <div className="category-emoji">{cat.emoji}</div>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
            </button>
          ))}
        </div>

        {activeId && activeCat && (
          <div>
            <div className="section-header" style={{ textAlign: "left", marginBottom: "28px" }}>
              <h2>
                {activeCat.emoji} {activeCat.name}
              </h2>
              <p>
                {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ProductGrid products={filtered} />
          </div>
        )}

        {!activeId && (
          <div style={{ textAlign: "center", color: "var(--text-light)", padding: "40px 0" }}>
            <p style={{ fontSize: "2.5rem" }}>☝️</p>
            <p style={{ fontWeight: 600, marginTop: "12px" }}>
              Seleccioná una categoría para ver sus productos
            </p>
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
