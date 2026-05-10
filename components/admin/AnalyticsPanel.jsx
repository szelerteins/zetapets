"use client"

import { useState, useEffect } from "react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts"

export default function AnalyticsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(res => { setData(res.error ? null : res); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
      Cargando analytics...
    </div>
  )

  if (!data) return (
    <div className="analytics-banner analytics-banner--warning">
      <span>⚠️</span>
      <span>No se pudieron cargar los datos. Verificá que <strong>SUPABASE_SERVICE_ROLE_KEY</strong> esté configurado en Vercel y que hayas corrido la migración <code>004_page_views.sql</code> en Supabase.</span>
    </div>
  )

  return (
    <div className="analytics-wrap">

      {/* Métricas rápidas */}
      <div className="analytics-metrics">
        <div className="analytics-metric">
          <span className="analytics-metric-icon">👁️</span>
          <div>
            <p className="analytics-metric-value">{data.totalViews.toLocaleString("es-AR")}</p>
            <p className="analytics-metric-label">Vistas últimos 30 días</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">📅</span>
          <div>
            <p className="analytics-metric-value">{data.viewsToday.toLocaleString("es-AR")}</p>
            <p className="analytics-metric-label">Vistas hoy</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">🖥️</span>
          <div>
            <p className="analytics-metric-value">{data.devices.find(d => d.label.startsWith("Desktop"))?.pct ?? 0}%</p>
            <p className="analytics-metric-label">Desde desktop</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">📱</span>
          <div>
            <p className="analytics-metric-value">{data.devices.find(d => d.label.startsWith("Mobile"))?.pct ?? 0}%</p>
            <p className="analytics-metric-label">Desde mobile</p>
          </div>
        </div>
      </div>

      {/* Gráfico visitas diarias */}
      <div className="admin-chart-card">
        <h3 className="admin-chart-title">Visitas diarias — últimos 14 días</h3>
        {data.totalViews === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF", fontSize: "0.9rem" }}>
            Aún no hay visitas registradas. Las próximas visitas al sitio aparecerán aquí.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.salesByDay} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "Visitas"]} />
              <Bar dataKey="visitas" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="analytics-grid">
        {/* Top páginas */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Páginas más vistas</h3>
          {data.topPages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: "0.85rem" }}>
              Sin datos aún
            </div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr><th>Página</th><th>Visitas</th></tr>
                </thead>
                <tbody>
                  {data.topPages.map((p) => (
                    <tr key={p.page}>
                      <td><code>{p.page}</code></td>
                      <td><strong>{p.visitas}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dispositivos */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Dispositivos</h3>
          {data.totalViews === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: "0.85rem" }}>
              Sin datos aún
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
              {data.devices.map((d) => (
                <div key={d.label} className="traffic-row">
                  <span className="traffic-source">{d.label}</span>
                  <div className="traffic-bar-wrap">
                    <div className="traffic-bar" style={{ width: `${d.pct}%`, background: d.color }} />
                  </div>
                  <span className="traffic-pct">{d.pct}%</span>
                  <span className="traffic-visits">{d.count} visitas</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
