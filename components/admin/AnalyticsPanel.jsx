"use client"

import { useState, useEffect, useCallback } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import {
  MdOutlineWarningAmber,
  MdOutlineRemoveRedEye,
  MdOutlineMouse,
  MdOutlineTrendingDown,
  MdOutlinePersonAddAlt,
  MdOutlineTimer,
  MdOutlineArticle,
  MdOutlinePersonAdd,
  MdOutlineRepeat,
  MdOutlineAdsClick,
} from "react-icons/md"

const RANGES = [
  { key: "1d",   label: "Hoy" },
  { key: "7d",   label: "7 días" },
  { key: "30d",  label: "30 días" },
  { key: "180d", label: "6 meses" },
  { key: "365d", label: "1 año" },
]

function fmtTime(secs) {
  if (!secs) return "—"
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function AnalyticsPanel() {
  const [range, setRange] = useState("30d")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/admin/analytics?range=${range}`)
      .then(r => r.json())
      .then(res => { setData(res.error ? null : res); setLoading(false) })
      .catch(() => setLoading(false))
  }, [range])

  useEffect(() => { load() }, [load])

  return (
    <div className="analytics-wrap">

      {/* Range filter */}
      <div className="analytics-range-tabs">
        {RANGES.map(r => (
          <button
            key={r.key}
            className={`analytics-range-tab ${range === r.key ? "active" : ""}`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
          Cargando analytics...
        </div>
      )}

      {!loading && !data && (
        <div className="analytics-banner analytics-banner--warning">
          <MdOutlineWarningAmber size={18} style={{ flexShrink: 0 }} />
          <span>No se pudieron cargar los datos. Verificá que <strong>SUPABASE_SERVICE_ROLE_KEY</strong> esté configurado y hayas corrido la migración <code>005_analytics_enhanced.sql</code> en Supabase.</span>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Métricas principales */}
          <div className="analytics-metrics analytics-metrics--6">
            <div className="analytics-metric">
              <span className="analytics-metric-icon"><MdOutlineRemoveRedEye size={24} /></span>
              <div>
                <p className="analytics-metric-value">{data.totalViews.toLocaleString("es-AR")}</p>
                <p className="analytics-metric-label">Vistas de página</p>
              </div>
            </div>
            <div className="analytics-metric">
              <span className="analytics-metric-icon"><MdOutlineMouse size={24} /></span>
              <div>
                <p className="analytics-metric-value">{data.totalClicks.toLocaleString("es-AR")}</p>
                <p className="analytics-metric-label">Clicks totales</p>
              </div>
            </div>
            <div className="analytics-metric">
              <span className="analytics-metric-icon"><MdOutlineTrendingDown size={24} /></span>
              <div>
                <p className="analytics-metric-value">{data.bounceRate}%</p>
                <p className="analytics-metric-label">Tasa de rebote</p>
              </div>
            </div>
            <div className="analytics-metric">
              <span className="analytics-metric-icon"><MdOutlinePersonAddAlt size={24} /></span>
              <div>
                <p className="analytics-metric-value">{data.newVisitors.toLocaleString("es-AR")}</p>
                <p className="analytics-metric-label">Usuarios nuevos</p>
              </div>
            </div>
            <div className="analytics-metric">
              <span className="analytics-metric-icon"><MdOutlineTimer size={24} /></span>
              <div>
                <p className="analytics-metric-value">{fmtTime(data.avgTimeOnSite)}</p>
                <p className="analytics-metric-label">Tiempo promedio</p>
              </div>
            </div>
            <div className="analytics-metric">
              <span className="analytics-metric-icon"><MdOutlineArticle size={24} /></span>
              <div>
                <p className="analytics-metric-value">{data.avgScrollDepth > 0 ? `${data.avgScrollDepth}%` : "—"}</p>
                <p className="analytics-metric-label">Scroll depth</p>
              </div>
            </div>
          </div>

          {/* Gráfico visitas */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Visitas — {RANGES.find(r=>r.key===range)?.label}</h3>
            {data.totalViews === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:"#9CA3AF" }}>
                Sin visitas en este período todavía.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.salesByDay} margin={{ top:8, right:16, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize:11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize:11 }} allowDecimals={false} />
                  <Tooltip formatter={v => [v, "Visitas"]} />
                  <Bar dataKey="visitas" fill="#7C3AED" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top páginas + dispositivos */}
          <div className="analytics-grid">
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">Páginas más vistas</h3>
              {data.topPages.length === 0 ? (
                <div style={{ textAlign:"center", padding:"24px 0", color:"#9CA3AF" }}>Sin datos</div>
              ) : (
                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Página</th><th>Vistas</th><th>Scroll avg</th></tr>
                    </thead>
                    <tbody>
                      {data.topPages.map(p => (
                        <tr key={p.page}>
                          <td><code>{p.page}</code></td>
                          <td><strong>{p.visitas}</strong></td>
                          <td>
                            <div className="scroll-depth-cell">
                              <div className="scroll-depth-bar" style={{ width: `${p.avgScroll}%` }} />
                              <span>{p.avgScroll > 0 ? `${p.avgScroll}%` : "—"}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-chart-card">
              <h3 className="admin-chart-title">Dispositivos</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:8 }}>
                {data.devices.map(d => (
                  <div key={d.label} className="traffic-row">
                    <span className="traffic-source">{d.icon} {d.label}</span>
                    <div className="traffic-bar-wrap">
                      <div className="traffic-bar" style={{ width:`${d.pct}%`, background:d.color }} />
                    </div>
                    <span className="traffic-pct">{d.pct}%</span>
                    <span className="traffic-visits">{d.count}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid #F3F4F6" }}>
                <p style={{ fontSize:"0.82rem", color:"#6B7280", marginBottom:8 }}>Nuevos vs. recurrentes</p>
                <div className="traffic-row">
                  <span className="traffic-source" style={{ display: "flex", alignItems: "center", gap: "4px" }}><MdOutlinePersonAdd size={14} /> Nuevos</span>
                  <div className="traffic-bar-wrap">
                    <div className="traffic-bar" style={{ width: data.totalViews > 0 ? `${Math.round(data.newVisitors/data.totalViews*100)}%` : "0%", background:"#7AC74F" }} />
                  </div>
                  <span className="traffic-pct">{data.totalViews > 0 ? Math.round(data.newVisitors/data.totalViews*100) : 0}%</span>
                  <span className="traffic-visits">{data.newVisitors}</span>
                </div>
                <div className="traffic-row">
                  <span className="traffic-source" style={{ display: "flex", alignItems: "center", gap: "4px" }}><MdOutlineRepeat size={14} /> Recurrentes</span>
                  <div className="traffic-bar-wrap">
                    <div className="traffic-bar" style={{ width: data.totalViews > 0 ? `${Math.round(data.returningVisitors/data.totalViews*100)}%` : "0%", background:"#5BC0EB" }} />
                  </div>
                  <span className="traffic-pct">{data.totalViews > 0 ? Math.round(data.returningVisitors/data.totalViews*100) : 0}%</span>
                  <span className="traffic-visits">{data.returningVisitors}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Adquisición */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Adquisición — Fuentes de tráfico</h3>
            {data.acquisition.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0", color:"#9CA3AF" }}>Sin datos</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
                {data.acquisition.map(s => (
                  <div key={s.source} className="traffic-row">
                    <span className="traffic-source">{s.source}</span>
                    <div className="traffic-bar-wrap">
                      <div className="traffic-bar" style={{ width:`${s.pct}%`, background:s.color }} />
                    </div>
                    <span className="traffic-pct">{s.pct}%</span>
                    <span className="traffic-visits">{s.count} visitas</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Click Heatmap */}
          <div className="analytics-grid">
            <div className="admin-chart-card">
              <h3 className="admin-chart-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdOutlineAdsClick size={18} /> Click Heatmap</h3>
              <p style={{ fontSize:"0.78rem", color:"#9CA3AF", marginBottom:12 }}>Distribución de clicks en el viewport</p>
              {data.totalClicks === 0 ? (
                <div style={{ textAlign:"center", padding:"24px 0", color:"#9CA3AF" }}>Sin clicks registrados aún</div>
              ) : (
                <div className="heatmap-grid">
                  {data.heatmap.grid.map((row, ri) =>
                    row.map((val, ci) => {
                      const intensity = val / data.heatmap.maxClicks
                      const alpha = intensity === 0 ? 0.04 : 0.15 + intensity * 0.85
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className="heatmap-cell"
                          title={`${val} click${val !== 1 ? "s" : ""}`}
                          style={{ background: `rgba(239,68,68,${alpha})` }}
                        />
                      )
                    })
                  )}
                </div>
              )}
            </div>

            <div className="admin-chart-card">
              <h3 className="admin-chart-title">Elementos más clickeados</h3>
              {data.heatmap.topElements.length === 0 ? (
                <div style={{ textAlign:"center", padding:"24px 0", color:"#9CA3AF" }}>Sin datos aún</div>
              ) : (
                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Elemento</th><th>Clicks</th></tr>
                    </thead>
                    <tbody>
                      {data.heatmap.topElements.map((e, i) => (
                        <tr key={i}>
                          <td style={{ fontSize:"0.8rem", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {e.element}
                          </td>
                          <td><strong>{e.count}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
