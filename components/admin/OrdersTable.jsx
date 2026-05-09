"use client"

import { useState, useEffect, useCallback } from "react"

const statusMap = {
  pending:   "Pendiente",
  confirmed: "Confirmado",
  shipped:   "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
}
const statusColor = {
  pending:   "badge-yellow",
  confirmed: "badge-blue",
  shipped:   "badge-blue",
  delivered: "badge-green",
  cancelled: "badge-red",
}
const dbStatus = {
  "Todos": null,
  "Pendiente": "pending",
  "Confirmado": "confirmed",
  "Enviado": "shipped",
  "Entregado": "delivered",
  "Cancelado": "cancelled",
}

function formatPrice(n) {
  return "$" + Math.round(n).toLocaleString("es-AR")
}

export default function OrdersTable() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("Todos")
  const [updating, setUpdating] = useState(null)

  const loadOrders = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  async function changeStatus(orderId, newStatus) {
    setUpdating(orderId)
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    })
    await loadOrders()
    setUpdating(null)
  }

  const filterKeys = Object.keys(dbStatus)
  const filtered = filter === "Todos"
    ? orders
    : orders.filter(o => o.status === dbStatus[filter])

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <h3>Pedidos reales</h3>
        <div className="admin-filter-chips">
          {filterKeys.map((e) => (
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

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Cargando pedidos...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>No hay pedidos en este estado.</div>
      ) : (
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
                  <td><code className="order-id">{order.order_number}</code></td>
                  <td>
                    <div className="client-cell">
                      <strong>{order.profiles?.full_name || "—"}</strong>
                    </div>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString("es-AR")}</td>
                  <td>
                    <ul className="product-list">
                      {(order.order_items || []).map((item, i) => (
                        <li key={i}>
                          {item.product_name}
                          {item.variant ? ` (${item.variant})` : ""}
                          {" ×"}{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td><strong>{formatPrice(order.total)}</strong></td>
                  <td>{order.payment_method || "—"}</td>
                  <td>
                    <select
                      className={`admin-badge ${statusColor[order.status]} status-select`}
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={e => changeStatus(order.id, e.target.value)}
                      style={{ cursor: "pointer", border: "none", fontFamily: "inherit", fontWeight: 600, fontSize: "0.78rem" }}
                    >
                      {Object.entries(statusMap).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="address-cell">
                    {[order.shipping_address, order.shipping_city, order.shipping_postal_code].filter(Boolean).join(", ")}
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
