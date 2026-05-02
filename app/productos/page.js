"use client"

import { useState } from "react"
import ProductGrid from "../../components/ProductGrid"
import { products } from "../../data/products"
import { categories } from "../../data/categories"

export default function ProductosPage() {
  const [activeFilter, setActiveFilter] = useState("Todos")

  const filtered =
    activeFilter === "Todos"
      ? products
      : products.filter((p) => p.category === activeFilter)

  const categoryNames = ["Todos", ...categories.map((c) => c.name)]

  return (
    <>
      <div className="page-header">
        <h1>Todos los productos</h1>
        <p>Encontrá lo mejor para tu mascota</p>
      </div>

      <section style={{ padding: "0 0 80px" }}>
        <div className="container">
          <div className="filter-bar">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${activeFilter === cat ? "active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <p style={{ fontSize: "0.87rem", color: "var(--text-light)", marginBottom: "24px" }}>
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>

          <ProductGrid products={filtered} />
        </div>
      </section>
    </>
  )
}
