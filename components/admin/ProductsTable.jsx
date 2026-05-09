"use client"

import { useState, useEffect } from "react"

function formatPrice(n) {
  return "$" + Math.round(n).toLocaleString("es-AR")
}

export default function ProductsTable() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  function loadProducts() {
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  async function toggleActive(id, currentValue) {
    setToggling(id)
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !currentValue }),
    })
    loadProducts()
    setToggling(null)
  }

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <h3>Gestión de productos</h3>
        <span className="admin-table-count">{products.length} productos</span>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Cargando productos...</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={!p.is_active ? "row-paused" : ""}>
                  <td>
                    <div className="product-cell">
                      <span className="product-emoji-sm">{p.emoji}</span>
                      <div>
                        <strong>{p.name}</strong>
                        {p.badge && <span className="product-badge-sm">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td><strong>{formatPrice(p.price)}</strong></td>
                  <td>
                    <span className={`stock-badge ${(p.stock || 0) <= 10 ? "stock-low" : "stock-ok"}`}>
                      {p.stock ?? 0} u.
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${p.is_active ? "badge-green" : "badge-yellow"}`}>
                      {p.is_active ? "Activo" : "Pausado"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn pause"
                        title={p.is_active ? "Pausar" : "Activar"}
                        disabled={toggling === p.id}
                        onClick={() => toggleActive(p.id, p.is_active)}
                      >
                        {p.is_active ? "⏸️" : "▶️"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
