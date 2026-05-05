"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { analytics, salesByDay } from "../../data/adminData"

/**
 * Para conectar Google Analytics real:
 * 1. Agregá en .env.local: NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 * 2. Instalá: npm install @next/third-parties
 * 3. En app/layout.js:
 *    import { GoogleAnalytics } from '@next/third-parties/google'
 *    <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
 * 4. Reemplazá los datos simulados con la API de GA4 (Data API)
 */

export default function AnalyticsPanel() {
  return (
    <div className="analytics-wrap">
      {/* Banner simulado */}
      <div className="analytics-banner">
        <span>📌</span>
        <span>
          Datos simulados. Para conectar Google Analytics real, configurá{" "}
          <code>NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX</code> en tu archivo{" "}
          <code>.env.local</code>.
        </span>
      </div>

      {/* Métricas rápidas */}
      <div className="analytics-metrics">
        <div className="analytics-metric">
          <span className="analytics-metric-icon">👥</span>
          <div>
            <p className="analytics-metric-value">{analytics.activeUsers}</p>
            <p className="analytics-metric-label">Usuarios activos ahora</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">👁️</span>
          <div>
            <p className="analytics-metric-value">{analytics.pageViews.toLocaleString()}</p>
            <p className="analytics-metric-label">Vistas del mes</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">⏱️</span>
          <div>
            <p className="analytics-metric-value">{analytics.avgSessionDuration}</p>
            <p className="analytics-metric-label">Duración promedio</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">↩️</span>
          <div>
            <p className="analytics-metric-value">{analytics.bounceRate}%</p>
            <p className="analytics-metric-label">Tasa de rebote</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Fuentes de tráfico */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Fuente de tráfico</h3>
          {analytics.trafficSources.map((s) => (
            <div key={s.source} className="traffic-row">
              <span className="traffic-source">{s.source}</span>
              <div className="traffic-bar-wrap">
                <div
                  className="traffic-bar"
                  style={{ width: `${s.porcentaje}%`, background: s.color }}
                />
              </div>
              <span className="traffic-pct">{s.porcentaje}%</span>
              <span className="traffic-visits">{s.visitas.toLocaleString()} visitas</span>
            </div>
          ))}
        </div>

        {/* Páginas más vistas */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Páginas más vistas</h3>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Página</th>
                  <th>Visitas</th>
                  <th>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPages.map((p) => (
                  <tr key={p.page}>
                    <td><code>{p.page}</code></td>
                    <td>{p.visitas.toLocaleString()}</td>
                    <td>{p.tiempo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Gráfico visitas */}
      <div className="admin-chart-card">
        <h3 className="admin-chart-title">Visitas diarias (estimado)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={salesByDay.map((d) => ({ day: d.day, visitas: d.ventas * 18 }))}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={1} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [v, "Visitas"]} />
            <Bar dataKey="visitas" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
