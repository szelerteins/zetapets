"use client"

const VERCEL_PROJECT = "zetapets"
const VERCEL_DASHBOARD = `https://vercel.com/szelerteins-projects/${VERCEL_PROJECT}/analytics`

const pages = [
  { page: "/",           label: "Inicio" },
  { page: "/productos",  label: "Productos" },
  { page: "/categorias", label: "Categorías" },
  { page: "/checkout",   label: "Checkout" },
  { page: "/contacto",   label: "Contacto" },
  { page: "/account",    label: "Mi cuenta" },
  { page: "/orders",     label: "Mis pedidos" },
]

export default function AnalyticsPanel() {
  return (
    <div className="analytics-wrap">

      {/* Banner estado */}
      <div className="analytics-banner analytics-banner--connected">
        <span>✅</span>
        <span>Vercel Analytics activo — cada visita al sitio queda registrada automáticamente</span>
        <a
          href={VERCEL_DASHBOARD}
          target="_blank"
          rel="noopener noreferrer"
          className="analytics-ga-btn"
        >
          Ver Analytics →
        </a>
      </div>

      {/* Accesos rápidos */}
      <div className="analytics-shortcuts">
        <a href={VERCEL_DASHBOARD} target="_blank" rel="noopener noreferrer" className="analytics-shortcut-card">
          <span className="analytics-shortcut-icon">📊</span>
          <div>
            <p className="analytics-shortcut-title">Visitas y pageviews</p>
            <p className="analytics-shortcut-sub">Tráfico total, sesiones y visitantes únicos</p>
          </div>
          <span className="analytics-shortcut-arrow">→</span>
        </a>
        <a href={`${VERCEL_DASHBOARD}?tab=speed`} target="_blank" rel="noopener noreferrer" className="analytics-shortcut-card">
          <span className="analytics-shortcut-icon">⚡</span>
          <div>
            <p className="analytics-shortcut-title">Velocidad del sitio</p>
            <p className="analytics-shortcut-sub">Core Web Vitals, LCP, CLS, FID</p>
          </div>
          <span className="analytics-shortcut-arrow">→</span>
        </a>
        <a href={`${VERCEL_DASHBOARD}?tab=audience`} target="_blank" rel="noopener noreferrer" className="analytics-shortcut-card">
          <span className="analytics-shortcut-icon">🌍</span>
          <div>
            <p className="analytics-shortcut-title">Audiencia</p>
            <p className="analytics-shortcut-sub">Países, dispositivos y navegadores</p>
          </div>
          <span className="analytics-shortcut-arrow">→</span>
        </a>
        <a href={`https://vercel.com/szelerteins-projects/${VERCEL_PROJECT}/deployments`} target="_blank" rel="noopener noreferrer" className="analytics-shortcut-card">
          <span className="analytics-shortcut-icon">🚀</span>
          <div>
            <p className="analytics-shortcut-title">Deployments</p>
            <p className="analytics-shortcut-sub">Historial de versiones publicadas</p>
          </div>
          <span className="analytics-shortcut-arrow">→</span>
        </a>
      </div>

      {/* Qué se está midiendo */}
      <div className="admin-chart-card">
        <h3 className="admin-chart-title">Páginas monitoreadas</h3>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ruta</th>
                <th>Sección</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.page}>
                  <td><code>{p.page}</code></td>
                  <td>{p.label}</td>
                  <td><span className="admin-badge badge-green">Activo</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info adicional */}
      <div className="analytics-info-grid">
        <div className="analytics-info-card">
          <p className="analytics-info-icon">🔒</p>
          <p className="analytics-info-title">Privacidad</p>
          <p className="analytics-info-text">Vercel Analytics no usa cookies ni almacena IPs. Cumple con GDPR automáticamente.</p>
        </div>
        <div className="analytics-info-card">
          <p className="analytics-info-icon">⚡</p>
          <p className="analytics-info-title">Sin impacto en velocidad</p>
          <p className="analytics-info-text">El script se carga de forma lazy y no afecta el rendimiento del sitio.</p>
        </div>
        <div className="analytics-info-card">
          <p className="analytics-info-icon">📱</p>
          <p className="analytics-info-title">Multi-dispositivo</p>
          <p className="analytics-info-text">Mide visitas desde celular, tablet y escritorio por separado.</p>
        </div>
      </div>

    </div>
  )
}
