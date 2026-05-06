"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/admin/dashboard",              label: "Dashboard",    icon: "📊" },
  { href: "/admin/dashboard/analytics",    label: "Analytics",    icon: "📈" },
  { href: "/admin/dashboard/ventas",       label: "Ventas",       icon: "🛒" },
  { href: "/admin/dashboard/facturacion",  label: "Facturación",  icon: "🧾" },
  { href: "/admin/dashboard/productos",    label: "Productos",    icon: "📦" },
  { href: "/admin/dashboard/clientes",     label: "Clientes",     icon: "👥" },
  { href: "/admin/dashboard/configuracion",label: "Configuración",icon: "⚙️" },
]

export default function AdminSidebar({ onClose, isOpen }) {
  const pathname = usePathname()

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Si falla la llamada, igual redirigir
    }
    localStorage.removeItem("zetapets-admin") // limpiar por si quedó algo del sistema viejo
    window.location.href = "/login"
  }

  return (
    <aside className={`admin-sidebar${isOpen ? " open" : ""}`}>
      <div className="admin-sidebar-logo">
        <span className="admin-sidebar-brand">Zeta<span>Pets</span></span>
        <span className="admin-sidebar-badge">Admin</span>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <button className="admin-logout-btn" onClick={handleLogout}>
        <span>🚪</span>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}
