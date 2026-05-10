"use client"

import { analytics, salesByDay } from "../../data/adminData"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const isConnected = !!GA_ID

export default function AnalyticsPanel() {
  return (
    <div className="analytics-wrap">

      {/* Estado de conexión */}
      {isConnected ? (
        <div className="analytics-banner analytics-banner--connected">
          <span>✅</span>
          <span>
            Google Analytics conectado correctamente —{" "}
            <strong>{GA_ID}</strong>
          </span>
          <a
            href={`https://analytics.google.com/analytics/web/#/p${GA_ID?.replace("G-", "")}/reports/reportinghub`}
            target="_blank"
            rel="noopener noreferrer"
            className="analytics-ga-btn"
          >
            Abrir Google Analytics →
          </a>
        </div>
      ) : (
        <div className="analytics-banner analytics-banner--warning">
          <span>⚠️</span>
          <div>
            <strong>Google Analytics no está conectado todavía.</strong>
            <span> Seguí los pasos de abajo para activarlo.</span>
          </div>
        </div>
      )}

      {/* Pasos de configuración si no está conectado */}
      {!isConnected && (
        <div className="analytics-setup">
          <h3 className="analytics-setup-title">Cómo conectar Google Analytics</h3>
          <ol className="analytics-setup-steps">
            <li>
              Entrá a{" "}
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                analytics.google.com
              </a>{" "}
              → creá una cuenta y una propiedad <strong>GA4</strong> para tu sitio
            </li>
            <li>
              En Google Analytics → <strong>Admin → Flujos de datos → tu sitio</strong> → copiá el <strong>ID de medición</strong> (empieza con <code>G-</code>)
            </li>
            <li>
              En <strong>Vercel → Settings → Environment Variables</strong> agregá:
              <code className="analytics-env-var">NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX</code>
            </li>
            <li>
              Hacé <strong>Redeploy</strong> en Vercel y listo — cada visita quedará registrada en GA
            </li>
          </ol>
        </div>
      )}

      {/* Botón directo al dashboard de GA */}
      {isConnected && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="analytics-action-btn analytics-action-btn--primary"
          >
            📊 Ver reporte completo en GA
          </a>
          <a
            href="https://analytics.google.com/analytics/web/#/realtime"
            target="_blank"
            rel="noopener noreferrer"
            className="analytics-action-btn"
          >
            🟢 Usuarios en tiempo real
          </a>
        </div>
      )}

      {/* Métricas — reales si GA está conectado, estimadas si no */}
      <div className="analytics-metrics">
        <div className="analytics-metric">
          <span className="analytics-metric-icon">👥</span>
          <div>
            <p className="analytics-metric-value">{isConnected ? "Ver en GA" : analytics.activeUsers}</p>
            <p className="analytics-metric-label">Usuarios activos ahora</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">👁️</span>
          <div>
            <p className="analytics-metric-value">{isConnected ? "Ver en GA" : analytics.pageViews.toLocaleString()}</p>
            <p className="analytics-metric-label">Vistas del mes</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">⏱️</span>
          <div>
            <p className="analytics-metric-value">{isConnected ? "Ver en GA" : analytics.avgSessionDuration}</p>
            <p className="analytics-metric-label">Duración promedio</p>
          </div>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-icon">↩️</span>
          <div>
            <p className="analytics-metric-value">{isConnected ? "Ver en GA" : `${analytics.bounceRate}%`}</p>
            <p className="analytics-metric-label">Tasa de rebote</p>
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="analytics-grid">
          {/* Fuentes de tráfico (simulado) */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Fuente de tráfico <span className="badge-sim">estimado</span></h3>
            {analytics.trafficSources.map((s) => (
              <div key={s.source} className="traffic-row">
                <span className="traffic-source">{s.source}</span>
                <div className="traffic-bar-wrap">
                  <div className="traffic-bar" style={{ width: `${s.porcentaje}%`, background: s.color }} />
                </div>
                <span className="traffic-pct">{s.porcentaje}%</span>
                <span className="traffic-visits">{s.visitas.toLocaleString()} visitas</span>
              </div>
            ))}
          </div>

          {/* Páginas más vistas (simulado) */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Páginas más vistas <span className="badge-sim">estimado</span></h3>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr><th>Página</th><th>Visitas</th><th>Tiempo</th></tr>
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
      )}

      {/* Gráfico visitas estimadas (solo si no hay GA) */}
      {!isConnected && (
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Visitas diarias <span className="badge-sim">estimado</span></h3>
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
      )}

    </div>
  )
}
