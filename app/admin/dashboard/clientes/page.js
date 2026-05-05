"use client"

import AdminLayout from "../../../../components/admin/AdminLayout"
import { clients, metrics } from "../../../../data/adminData"

function fmt(n) { return "$" + n.toLocaleString("es-AR") }

export default function ClientesPage() {
  return (
    <AdminLayout title="Clientes">
      <div className="metrics-grid metrics-grid--sm">
        <div className="billing-card">
          <p className="billing-card-label">Total clientes</p>
          <p className="billing-card-value">{metrics.registeredClients}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Carritos abandonados</p>
          <p className="billing-card-value">{metrics.abandonedCarts}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Conversión</p>
          <p className="billing-card-value">{metrics.conversionRate}%</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Clientes activos</p>
          <p className="billing-card-value">{clients.filter(c => c.estado === "Activo").length}</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Base de clientes</h3>
          <span className="admin-table-count">{clients.length} clientes</span>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Ciudad</th>
                <th>Pedidos</th>
                <th>Gasto total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.ciudad}</td>
                  <td>{c.pedidos}</td>
                  <td><strong>{fmt(c.gasto)}</strong></td>
                  <td>
                    <span className={`admin-badge ${c.estado === "Activo" ? "badge-green" : "badge-yellow"}`}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
