"use client"

import AdminLayout from "../../../components/admin/AdminLayout"
import MetricCard from "../../../components/admin/MetricCard"
import { SalesLineChart, RevenueBarChart, TopProductsChart, OrderStatusChart } from "../../../components/admin/SalesChart"
import { metrics } from "../../../data/adminData"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      {/* Métricas */}
      <div className="metrics-grid">
        <MetricCard
          icon="💰" label="Facturación total" color="verde"
          value={formatPrice(metrics.totalRevenue)} trend={12.4}
          sub="Este mes"
        />
        <MetricCard
          icon="🛒" label="Ventas totales" color="celeste"
          value={metrics.totalSales.toLocaleString()} trend={8.1}
          sub="Unidades vendidas"
        />
        <MetricCard
          icon="📋" label="Pedidos" color="purple"
          value={metrics.totalOrders} trend={5.3}
          sub="Pedidos confirmados"
        />
        <MetricCard
          icon="🎯" label="Ticket promedio" color="orange"
          value={formatPrice(metrics.avgTicket)} trend={3.2}
          sub="Por compra"
        />
        <MetricCard
          icon="🛍️" label="Carritos abandonados" color="red"
          value={metrics.abandonedCarts} trend={-4.1}
          sub="Último mes"
        />
        <MetricCard
          icon="👥" label="Clientes" color="verde"
          value={metrics.registeredClients} trend={15.7}
          sub="Registrados"
        />
        <MetricCard
          icon="📈" label="Tasa de conversión" color="celeste"
          value={`${metrics.conversionRate}%`} trend={0.8}
          sub="Visitas → compras"
        />
        <MetricCard
          icon="🏆" label="Producto estrella" color="purple"
          value="V2" sub={metrics.topProduct}
        />
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <SalesLineChart />
        <RevenueBarChart />
        <TopProductsChart />
        <OrderStatusChart />
      </div>
    </AdminLayout>
  )
}
