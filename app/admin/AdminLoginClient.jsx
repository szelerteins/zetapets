"use client"

/**
 * AdminLoginClient.jsx
 * Si el usuario llega a /admin sin sesión, el middleware lo redirige a /login.
 * Esta página solo se muestra si no hay sesión activa (raro, pero por si acaso).
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginClient() {
  const router = useRouter()

  useEffect(() => {
    // El middleware ya debería haber redirigido,
    // pero como fallback redirigimos al login
    router.replace("/login")
  }, [router])

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
          Redirigiendo al login...
        </p>
      </div>
    </div>
  )
}
