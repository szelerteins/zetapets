"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../../../components/admin/AdminLayout"
import OrdersTable from "../../../../components/admin/OrdersTable"

function fmt(n) { return "$" + Math.round(n).toLocaleString("es-AR") }

export default function VentasPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  return (
    <AdminLayout title="Ventas y Pedidos">
      <div className="metrics-grid metrics-grid--sm">
        <div className="billing-card">
          <p className="billing-card-label">Total vendido</p>
          <p className="billing-card-value">{stats ? fmt(stats.totalRevenue) : "—"}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Pedidos totales</p>
          <p className="billing-card-value">{stats?.totalOrders ?? "—"}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Ticket promedio</p>
          <p className="billing-card-value">{stats ? fmt(stats.avgTicket) : "—"}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Pendientes</p>
          <p className="billing-card-value">{stats?.statusCounts?.pending ?? "—"}</p>
        </div>
      </div>
      <OrdersTable />
    </AdminLayout>
  )
}
