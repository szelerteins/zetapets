"use client"

import AdminLayout from "../../../../components/admin/AdminLayout"
import OrdersTable from "../../../../components/admin/OrdersTable"
import { SalesLineChart, RevenueBarChart } from "../../../../components/admin/SalesChart"
import { metrics } from "../../../../data/adminData"

function fmt(n) { return "$" + n.toLocaleString("es-AR") }

export default function VentasPage() {
  return (
    <AdminLayout title="Ventas y Pedidos">
      <div className="metrics-grid metrics-grid--sm">
        <div className="billing-card">
          <p className="billing-card-label">Total vendido</p>
          <p className="billing-card-value">{fmt(metrics.totalRevenue)}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Pedidos totales</p>
          <p className="billing-card-value">{metrics.totalOrders}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Ticket promedio</p>
          <p className="billing-card-value">{fmt(metrics.avgTicket)}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Conversión</p>
          <p className="billing-card-value">{metrics.conversionRate}%</p>
        </div>
      </div>

      <div className="charts-grid charts-grid--2">
        <SalesLineChart />
        <RevenueBarChart />
      </div>

      <OrdersTable />
    </AdminLayout>
  )
}
