"use client"

import { useState } from "react"
import { orders } from "../../data/adminData"

const statusColor = {
  Entregado: "badge-green",
  Enviado:   "badge-blue",
  Pendiente: "badge-yellow",
  Cancelado: "badge-red",
}

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function OrdersTable() {
  const [filter, setFilter] = useState("Todos")
  const estados = ["Todos", "Pendiente", "Enviado", "Entregado", "Cancelado"]

  const filtered = filter === "Todos" ? orders : orders.filter((o) => o.estado === filter)

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <h3>Pedidos recientes</h3>
        <div className="admin-filter-chips">
          {estados.map((e) => (
            <button
              key={e}
              className={`admin-chip ${filter === e ? "active" : ""}`}
              onClick={() => setFilter(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Pago</th>
              <th>Estado</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id}>
                <td><code className="order-id">{order.id}</code></td>
                <td>
                  <div className="client-cell">
                    <strong>{order.cliente}</strong>
                    <span>{order.email}</span>
                  </div>
                </td>
                <td>{order.fecha}</td>
                <td>
                  <ul className="product-list">
                    {order.productos.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </td>
                <td><strong>{formatPrice(order.total)}</strong></td>
                <td>{order.pago}</td>
                <td>
                  <span className={`admin-badge ${statusColor[order.estado]}`}>
                    {order.estado}
                  </span>
                </td>
                <td className="address-cell">{order.direccion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
