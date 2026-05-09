"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../../../components/admin/AdminLayout"

function fmt(n) { return "$" + Math.round(n).toLocaleString("es-AR") }

export default function ClientesPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/clients")
      .then(r => r.json())
      .then(data => { setClients(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalGasto = clients.reduce((s, c) => s + (c.gasto || 0), 0)
  const activos = clients.filter(c => c.activo).length

  return (
    <AdminLayout title="Clientes">
      <div className="metrics-grid metrics-grid--sm">
        <div className="billing-card">
          <p className="billing-card-label">Total clientes</p>
          <p className="billing-card-value">{clients.length}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Clientes con pedidos</p>
          <p className="billing-card-value">{activos}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Sin pedidos</p>
          <p className="billing-card-value">{clients.length - activos}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Facturación total</p>
          <p className="billing-card-value">{fmt(totalGasto)}</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Base de clientes</h3>
          <span className="admin-table-count">{clients.length} clientes</span>
        </div>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Cargando...</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>No hay clientes registrados aún.</div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Ciudad</th>
                  <th>Pedidos</th>
                  <th>Gasto total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.user_id}>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.ciudad}</td>
                    <td>{c.pedidos}</td>
                    <td><strong>{fmt(c.gasto)}</strong></td>
                    <td>
                      <span className={`admin-badge ${c.activo ? "badge-green" : "badge-yellow"}`}>
                        {c.activo ? "Activo" : "Sin pedidos"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
