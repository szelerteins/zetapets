"use client"

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend
} from "recharts"
import { salesByDay, revenueByMonth, topProducts, ordersByStatus } from "../../data/adminData"

function fmt(n) {
  return "$" + (n / 1000).toFixed(0) + "K"
}

export function SalesLineChart() {
  return (
    <div className="admin-chart-card">
      <h3 className="admin-chart-title">Ventas por día (últimos 14 días)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={salesByDay} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={1} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [v, "Ventas"]} />
          <Line type="monotone" dataKey="ventas" stroke="#7AC74F" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RevenueBarChart() {
  return (
    <div className="admin-chart-card">
      <h3 className="admin-chart-title">Facturación mensual</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={revenueByMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => ["$" + v.toLocaleString("es-AR"), "Facturación"]} />
          <Bar dataKey="facturacion" fill="#5BC0EB" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopProductsChart() {
  return (
    <div className="admin-chart-card">
      <h3 className="admin-chart-title">Productos más vendidos</h3>
      <div className="top-products-list">
        {topProducts.map((p) => (
          <div key={p.name} className="top-product-row">
            <span className="top-product-name">{p.name}</span>
            <div className="top-product-bar-wrap">
              <div className="top-product-bar" style={{ width: `${p.porcentaje}%` }} />
            </div>
            <span className="top-product-count">{p.ventas}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const COLORS = ordersByStatus.map((o) => o.color)

export function OrderStatusChart() {
  return (
    <div className="admin-chart-card">
      <h3 className="admin-chart-title">Estado de pedidos</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={ordersByStatus}
            dataKey="cantidad"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ status, porcentaje }) => status}
          >
            {ordersByStatus.map((entry, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v + " pedidos", n]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
