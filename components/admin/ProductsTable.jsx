"use client"

import { useState, useEffect } from "react"
import { MdOutlinePause, MdOutlinePlayArrow, MdEdit, MdDelete, MdAdd } from "react-icons/md"

function formatPrice(n) {
  return "$" + Math.round(n).toLocaleString("es-AR")
}

export default function ProductsTable({ refreshKey = 0, onEdit, onNew }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)
  const [deleting, setDeleting] = useState(null)

  function loadProducts() {
    setLoading(true)
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [refreshKey])

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

  async function deleteProduct(id, name) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    loadProducts()
    setDeleting(null)
  }

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <div>
          <h3>Gestión de productos</h3>
          <span className="admin-table-count">{products.length} productos</span>
        </div>
        <button className="pf-btn-new" onClick={onNew}>
          <MdAdd size={18} /> Nueva publicación
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Cargando productos...</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
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
                      {p.images?.[0] || p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images?.[0] || p.image_url}
                          alt={p.name}
                          className="product-thumb-sm"
                        />
                      ) : (
                        <span className="product-emoji-sm">{p.emoji || "📦"}</span>
                      )}
                      <div>
                        <strong>{p.name}</strong>
                        {p.badge && <span className="product-badge-sm">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.8rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
                      {p.sku || "—"}
                    </code>
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
                        className="action-btn edit"
                        title="Editar"
                        onClick={() => onEdit(p)}
                        disabled={toggling === p.id || deleting === p.id}
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        className="action-btn pause"
                        title={p.is_active ? "Pausar" : "Activar"}
                        disabled={toggling === p.id}
                        onClick={() => toggleActive(p.id, p.is_active)}
                      >
                        {p.is_active ? <MdOutlinePause size={16} /> : <MdOutlinePlayArrow size={16} />}
                      </button>
                      <button
                        className="action-btn delete"
                        title="Eliminar"
                        disabled={deleting === p.id}
                        onClick={() => deleteProduct(p.id, p.name)}
                      >
                        <MdDelete size={16} />
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
