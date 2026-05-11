"use client"

import { useState, useEffect, useCallback } from "react"
import { jsPDF } from "jspdf"

function downloadShippingLabel(order) {
  const doc = new jsPDF({ unit: "mm", format: [100, 150] })

  const date = new Date(order.created_at).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
  const itemCount = (order.order_items || []).reduce((s, i) => s + i.quantity, 0)
  const clientName = order.shipping_name ||
    order.profiles?.full_name ||
    "—"
  const phone = order.shipping_phone || order.profiles?.phone || ""

  // Fondo blanco
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, 100, 150, "F")

  // Borde exterior
  doc.setDrawColor(30, 30, 30)
  doc.setLineWidth(0.8)
  doc.rect(4, 4, 92, 142)

  // Header ZetaPets
  doc.setFillColor(14, 165, 233)
  doc.rect(4, 4, 92, 22, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("ZetaPets", 50, 13, { align: "center" })
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("zetapets.vercel.app", 50, 20, { align: "center" })

  // Separador
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)

  // Sección DESTINATARIO
  doc.setTextColor(80, 80, 80)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.text("DESTINATARIO", 9, 33)

  doc.setDrawColor(14, 165, 233)
  doc.setLineWidth(0.4)
  doc.line(9, 35, 91, 35)

  doc.setTextColor(20, 20, 20)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text(clientName, 9, 43)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  let y = 51
  if (order.shipping_address) {
    doc.text(order.shipping_address, 9, y)
    y += 7
  }
  if (order.shipping_city) {
    doc.text(order.shipping_city, 9, y)
    y += 7
  }
  if (order.shipping_postal_code) {
    doc.setFont("helvetica", "bold")
    doc.text(`CP: ${order.shipping_postal_code}`, 9, y)
    doc.setFont("helvetica", "normal")
    y += 7
  }
  if (phone) {
    doc.text(`Tel: ${phone}`, 9, y)
    y += 7
  }

  // Separador
  y = Math.max(y + 2, 90)
  doc.setDrawColor(14, 165, 233)
  doc.setLineWidth(0.4)
  doc.line(9, y, 91, y)
  y += 6

  // Sección ORDEN
  doc.setTextColor(80, 80, 80)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.text("DATOS DEL ENVÍO", 9, y)
  y += 6

  doc.setTextColor(20, 20, 20)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(`Orden: ${order.order_number}`, 9, y)
  y += 7

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Fecha: ${date}`, 9, y)
  y += 7
  doc.text(`Cantidad: ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`, 9, y)

  // Footer
  doc.setFillColor(245, 245, 245)
  doc.rect(4, 130, 92, 16, "F")
  doc.setTextColor(120, 120, 120)
  doc.setFont("helvetica", "italic")
  doc.setFontSize(7)
  doc.text("Imprimí y pegá esta etiqueta en el paquete antes de despacharlo.", 50, 137, { align: "center" })
  doc.text("ZetaPets · Argentina", 50, 143, { align: "center" })

  doc.save(`etiqueta-${order.order_number}.pdf`)
}

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
                <th>Etiqueta</th>
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
                  <td>
                    <button
                      onClick={() => downloadShippingLabel(order)}
                      title="Descargar etiqueta de envío"
                      style={{
                        background: "#0ea5e9",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "5px 10px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      📦 PDF
                    </button>
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
