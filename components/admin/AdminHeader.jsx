"use client"

export default function AdminHeader({ title, onMenuToggle }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="admin-menu-toggle" onClick={onMenuToggle} aria-label="Menú">
          <span /><span /><span />
        </button>
        <div>
          <h1 className="admin-header-title">{title}</h1>
          <p className="admin-header-date">{dateStr}</p>
        </div>
      </div>
      <div className="admin-header-right">
        <div className="admin-avatar">
          <span>A</span>
          <div className="admin-avatar-info">
            <strong>Administrador</strong>
            <span>admin@zetapets.com</span>
          </div>
        </div>
      </div>
    </header>
  )
}
