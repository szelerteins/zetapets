"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import MetricCard from "../../../components/admin/MetricCard"
import { SalesLineChart, OrderStatusChart } from "../../../components/admin/SalesChart"

function formatPrice(n) {
  return "$" + Math.round(n).toLocaleString("es-AR")
}

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
        Cargando datos reales...
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="Dashboard">
      <div className="metrics-grid">
        <MetricCard icon="💰" label="Facturación total" color="verde"
          value={stats ? formatPrice(stats.totalRevenue) : "—"} sub="Pedidos activos" />
        <MetricCard icon="📋" label="Pedidos totales" color="purple"
          value={stats?.totalOrders ?? "—"} sub="Todos los estados" />
        <MetricCard icon="🎯" label="Ticket promedio" color="orange"
          value={stats ? formatPrice(stats.avgTicket) : "—"} sub="Por compra" />
        <MetricCard icon="👥" label="Clientes registrados" color="celeste"
          value={stats?.registeredClients ?? "—"} sub="Con perfil creado" />
        <MetricCard icon="⏳" label="Pendientes" color="orange"
          value={stats?.statusCounts?.pending ?? "—"} sub="Esperando confirmación" />
        <MetricCard icon="🚚" label="Enviados" color="celeste"
          value={stats?.statusCounts?.shipped ?? "—"} sub="En camino" />
        <MetricCard icon="✅" label="Entregados" color="verde"
          value={stats?.statusCounts?.delivered ?? "—"} sub="Completados" />
        <MetricCard icon="🏆" label="Producto más vendido" color="purple"
          value="" sub={stats?.topProduct ?? "—"} />
      </div>

      <div className="charts-grid">
        <SalesLineChart data={stats?.salesByDay} />
        <OrderStatusChart data={stats?.statusCounts} />
      </div>
    </AdminLayout>
  )
}
