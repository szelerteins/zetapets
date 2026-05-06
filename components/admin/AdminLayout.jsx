"use client"

/**
 * AdminLayout.jsx
 * Layout del panel de administrador.
 *
 * La protección real de las rutas la hace middleware.js (server-side).
 * Este componente verifica la sesión en el cliente como capa adicional
 * para evitar flash de contenido si el middleware no alcanzó a redirigir.
 *
 * FUTURO: con NextAuth, usar useSession() en lugar de fetch a /api/auth/me
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "./AdminSidebar"
import AdminHeader from "./AdminHeader"

export default function AdminLayout({ children, title = "Dashboard" }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Verificar sesión via API (la cookie httpOnly la maneja el navegador automáticamente)
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          setChecked(true)
        } else {
          router.replace("/login")
        }
      })
      .catch(() => router.replace("/login"))
  }, [router])

  if (!checked) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f6f9",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#6B7280",
      }}>
        Verificando acceso...
      </div>
    )
  }

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <AdminSidebar
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />

      <div className="admin-main">
        <AdminHeader
          title={title}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}
