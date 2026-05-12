"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../../../components/admin/AdminLayout"

function fmt(n) { return "$" + Math.round(n).toLocaleString("es-AR") }

const statusLabel = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
}
const statusBadge = {
  pending: "badge-yellow",
  confirmed: "badge-blue",
  shipped: "badge-blue",
  delivered: "badge-green",
  cancelled: "badge-red",
}

export default function FacturacionPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const active = orders.filter(o => o.status !== "cancelled")
  const totalBruto = active.reduce((s, o) => s + (o.total || 0), 0)
  const impuestos = Math.round(totalBruto * 0.21)
  const neto = totalBruto - impuestos
  const pagados = orders.filter(o => o.status === "delivered").length
  const pendientes = orders.filter(o => ["pending", "confirmed"].includes(o.status)).length
  const cancelados = orders.filter(o => o.status === "cancelled").length

  return (
    <AdminLayout title="Facturación">
      <div className="billing-wrap">
        <div className="billing-cards">
          <div className="billing-card">
            <p className="billing-card-label">Total bruto</p>
            <p className="billing-card-value">{fmt(totalBruto)}</p>
          </div>
          <div className="billing-card billing-card--tax">
            <p className="billing-card-label">Impuestos (21%)</p>
            <p className="billing-card-value">{fmt(impuestos)}</p>
          </div>
          <div className="billing-card billing-card--neto">
            <p className="billing-card-label">Total neto</p>
            <p className="billing-card-value">{fmt(neto)}</p>
          </div>
          <div className="billing-card">
            <p className="billing-card-label">Pedidos totales</p>
            <p className="billing-card-value">{orders.length}</p>
            <div className="billing-status-row">
              <span className="admin-badge badge-green">✓ {pagados} Entregados</span>
              <span className="admin-badge badge-yellow">{pendientes} Pendientes</span>
              <span className="admin-badge badge-red">✕ {cancelados} Cancelados</span>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ marginTop: 24 }}>
          <div className="admin-table-header">
            <h3>Últimos pedidos</h3>
          </div>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Cargando...</div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>N° Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map((o) => (
                    <tr key={o.id}>
                      <td><code className="order-id">{o.order_number}</code></td>
                      <td>{o.profiles?.full_name || "—"}</td>
                      <td>{new Date(o.created_at).toLocaleDateString("es-AR")}</td>
                      <td><strong>{fmt(o.total)}</strong></td>
                      <td>
                        <span className={`admin-badge ${statusBadge[o.status] || "badge-yellow"}`}>
                          {statusLabel[o.status] || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
