"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import MetricCard from "../../../components/admin/MetricCard"
import { SalesLineChart, OrderStatusChart } from "../../../components/admin/SalesChart"
import {
  MdOutlineAttachMoney,
  MdOutlineListAlt,
  MdOutlineLocalOffer,
  MdOutlinePeopleAlt,
  MdOutlineHourglassFull,
  MdOutlineLocalShipping,
  MdOutlineCheckCircle,
  MdOutlineEmojiEvents,
} from "react-icons/md"

function formatPrice(n) {
  return "$" + Math.round(n).toLocaleString("es-AR")
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
        <MetricCard icon={<MdOutlineAttachMoney size={24} />} label="Facturación total" color="verde"
          value={stats ? formatPrice(stats.totalRevenue) : "—"} sub="Pedidos activos" />
        <MetricCard icon={<MdOutlineListAlt size={24} />} label="Pedidos totales" color="purple"
          value={stats?.totalOrders ?? "—"} sub="Todos los estados" />
        <MetricCard icon={<MdOutlineLocalOffer size={24} />} label="Ticket promedio" color="orange"
          value={stats ? formatPrice(stats.avgTicket) : "—"} sub="Por compra" />
        <MetricCard icon={<MdOutlinePeopleAlt size={24} />} label="Clientes registrados" color="celeste"
          value={stats?.registeredClients ?? "—"} sub="Con perfil creado" />
        <MetricCard icon={<MdOutlineHourglassFull size={24} />} label="Pendientes" color="orange"
          value={stats?.statusCounts?.pending ?? "—"} sub="Esperando confirmación" />
        <MetricCard icon={<MdOutlineLocalShipping size={24} />} label="Enviados" color="celeste"
          value={stats?.statusCounts?.shipped ?? "—"} sub="En camino" />
        <MetricCard icon={<MdOutlineCheckCircle size={24} />} label="Entregados" color="verde"
          value={stats?.statusCounts?.delivered ?? "—"} sub="Completados" />
        <MetricCard icon={<MdOutlineEmojiEvents size={24} />} label="Producto más vendido" color="purple"
          value="" sub={stats?.topProduct ?? "—"} />
      </div>

      <div className="charts-grid">
        <SalesLineChart data={stats?.salesByDay} />
        <OrderStatusChart data={stats?.statusCounts} />
      </div>
    </AdminLayout>
  )
}
