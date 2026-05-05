"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "./AdminSidebar"
import AdminHeader from "./AdminHeader"

export default function AdminLayout({ children, title = "Dashboard" }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem("zetapets-admin")
    if (!session) {
      router.replace("/admin")
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) return null

  return (
    <div className="admin-layout">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />

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
