"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MdOutlineDashboard,
  MdOutlineInsights,
  MdOutlineShoppingCart,
  MdOutlineReceipt,
  MdOutlineInventory2,
  MdOutlinePeopleAlt,
  MdOutlineSettings,
  MdOutlineLogout,
} from "react-icons/md"

const navItems = [
  { href: "/admin/dashboard",               label: "Dashboard",     icon: <MdOutlineDashboard size={18} /> },
  { href: "/admin/dashboard/analytics",     label: "Analytics",     icon: <MdOutlineInsights size={18} /> },
  { href: "/admin/dashboard/ventas",        label: "Ventas",        icon: <MdOutlineShoppingCart size={18} /> },
  { href: "/admin/dashboard/facturacion",   label: "Facturación",   icon: <MdOutlineReceipt size={18} /> },
  { href: "/admin/dashboard/productos",     label: "Productos",     icon: <MdOutlineInventory2 size={18} /> },
  { href: "/admin/dashboard/clientes",      label: "Clientes",      icon: <MdOutlinePeopleAlt size={18} /> },
  { href: "/admin/dashboard/configuracion", label: "Configuración", icon: <MdOutlineSettings size={18} /> },
]

export default function AdminSidebar({ onClose, isOpen }) {
  const pathname = usePathname()

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Si falla la llamada, igual redirigir
    }
    localStorage.removeItem("zetapets-admin")
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
        <MdOutlineLogout size={16} />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}
