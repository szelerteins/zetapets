"use client"

import { useState } from "react"
import { products } from "../../data/products"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

// Stock simulado por producto
const simulatedStock = {
  1: 24, 2: 8, 3: 15, 4: 31, 5: 6,
  6: 19, 7: 42, 8: 28, 9: 13, 10: 55,
  11: 38, 12: 11, 13: 7, 14: 16,
}

export default function ProductsTable() {
  const [productStates, setProductStates] = useState(
    Object.fromEntries(products.map((p) => [p.id, "Activo"]))
  )

  function toggleState(id) {
    setProductStates((prev) => ({
      ...prev,
      [id]: prev[id] === "Activo" ? "Pausado" : "Activo",
    }))
  }

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <h3>Gestión de productos</h3>
        <span className="admin-table-count">{products.length} productos</span>
      </div>

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
            {products.map((p) => {
              const stock = simulatedStock[p.id] || 0
              const estado = productStates[p.id]
              return (
                <tr key={p.id} className={estado === "Pausado" ? "row-paused" : ""}>
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
                    <span className={`stock-badge ${stock <= 10 ? "stock-low" : "stock-ok"}`}>
                      {stock} u.
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${estado === "Activo" ? "badge-green" : "badge-yellow"}`}>
                      {estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn edit"
                        title="Editar"
                        onClick={() => alert("Próximamente: editar producto")}
                      >✏️</button>
                      <button
                        className="action-btn pause"
                        title={estado === "Activo" ? "Pausar" : "Activar"}
                        onClick={() => toggleState(p.id)}
                      >
                        {estado === "Activo" ? "⏸️" : "▶️"}
                      </button>
                      <button
                        className="action-btn delete"
                        title="Eliminar"
                        onClick={() => alert("Próximamente: eliminar producto")}
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
