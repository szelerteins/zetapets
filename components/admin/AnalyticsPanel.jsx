"use client"

import { useState, useEffect } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function AnalyticsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(res => {
        if (res.error) setError(res.error)
        else setData(res)
        setLoading(false)
      })
      .catch(() => { setError("Error de conexión"); setLoading(false) })
  }, [])

  const notConfigured = error === "GA no configurado"

  return (
    <div className="analytics-wrap">

      {/* Banner estado */}
      {notConfigured ? (
        <>
          <div className="analytics-banner analytics-banner--warning">
            <span>⚠️</span>
            <div>
              <strong>Analytics no está conectado al panel todavía.</strong>
              <span> Seguí los pasos de abajo para ver los datos reales aquí.</span>
            </div>
          </div>
          <div className="analytics-setup">
            <h3 className="analytics-setup-title">Cómo ver los datos de GA en el panel (3 pasos)</h3>
            <ol className="analytics-setup-steps">
              <li>
                Entrá a{" "}
                <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
                {" "}→ creá un proyecto → habilitá la <strong>API: "Google Analytics Data API"</strong>
              </li>
              <li>
                Dentro del proyecto → <strong>IAM y administración → Cuentas de servicio → Crear</strong>
                → descargá el archivo <strong>JSON</strong> de credenciales
              </li>
              <li>
                En <strong>Google Analytics → Admin → Acceso a la propiedad</strong> → agregá el email
                de la cuenta de servicio con rol <strong>Lector</strong>
              </li>
              <li>
                En <strong>Vercel → Environment Variables</strong> agregá estas dos variables:
                <code className="analytics-env-var">GOOGLE_GA_PROPERTY_ID = 123456789</code>
                <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block", margin: "4px 0 8px" }}>
                  (el número que aparece en GA → Admin → Información de la propiedad, sin el prefijo "properties/")
                </span>
                <code className="analytics-env-var">GOOGLE_SA_CREDENTIALS = {"{"}"type":"service_account","project_id":"..."{"}"}</code>
                <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block", marginTop: 4 }}>
                  (pegá el contenido completo del archivo JSON en una sola línea)
                </span>
              </li>
              <li>Hacé <strong>Redeploy</strong> en Vercel → ¡listo! Los datos van a aparecer acá.</li>
            </ol>
          </div>
        </>
      ) : (
        <div className="analytics-banner analytics-banner--connected">
          <span>✅</span>
          <span>Google Analytics conectado — datos de los últimos 28 días</span>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="analytics-ga-btn"
          >
            Abrir GA →
          </a>
        </div>
      )}

      {/* Loading */}
      {loading && !notConfigured && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
          Cargando datos de Google Analytics...
        </div>
      )}

      {/* Error genérico */}
      {error && !notConfigured && (
        <div className="analytics-banner analytics-banner--warning" style={{ marginTop: 12 }}>
          <span>❌</span>
          <span>Error al cargar: <strong>{error}</strong></span>
        </div>
      )}

      {/* Datos reales */}
      {data && (
        <>
          {/* Métricas rápidas */}
          <div className="analytics-metrics">
            <div className="analytics-metric">
              <span className="analytics-metric-icon">👥</span>
              <div>
                <p className="analytics-metric-value">{data.metrics.activeUsers.toLocaleString()}</p>
                <p className="analytics-metric-label">Usuarios activos (28 días)</p>
              </div>
            </div>
            <div className="analytics-metric">
              <span className="analytics-metric-icon">👁️</span>
              <div>
                <p className="analytics-metric-value">{data.metrics.pageViews.toLocaleString()}</p>
                <p className="analytics-metric-label">Vistas de página</p>
              </div>
            </div>
            <div className="analytics-metric">
              <span className="analytics-metric-icon">⏱️</span>
              <div>
                <p className="analytics-metric-value">{data.metrics.avgSessionDuration}</p>
                <p className="analytics-metric-label">Duración promedio</p>
              </div>
            </div>
            <div className="analytics-metric">
              <span className="analytics-metric-icon">↩️</span>
              <div>
                <p className="analytics-metric-value">{data.metrics.bounceRate}%</p>
                <p className="analytics-metric-label">Tasa de rebote</p>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            {/* Fuentes de tráfico */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">Fuente de tráfico</h3>
              {data.trafficSources.map((s) => (
                <div key={s.source} className="traffic-row">
                  <span className="traffic-source">{s.source}</span>
                  <div className="traffic-bar-wrap">
                    <div className="traffic-bar" style={{ width: `${s.porcentaje}%`, background: s.color }} />
                  </div>
                  <span className="traffic-pct">{s.porcentaje}%</span>
                  <span className="traffic-visits">{s.visitas.toLocaleString()} sesiones</span>
                </div>
              ))}
            </div>

            {/* Páginas más vistas */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">Páginas más vistas</h3>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>Página</th><th>Vistas</th><th>Tiempo</th></tr>
                  </thead>
                  <tbody>
                    {data.topPages.map((p) => (
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

          {/* Gráfico visitas diarias */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Sesiones diarias — últimos 14 días</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.salesByDay} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, "Sesiones"]} />
                <Bar dataKey="ventas" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Sesiones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

    </div>
  )
}
