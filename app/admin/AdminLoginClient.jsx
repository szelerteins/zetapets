"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// SIMULADO: en producción usar autenticación real con backend/NextAuth
const ADMIN_USER = "admin"
const ADMIN_PASS = "admin123"

export default function AdminLoginClient() {
  const router = useRouter()
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("zetapets-admin")) {
      router.replace("/admin/dashboard")
    }
  }, [router])

  function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    setTimeout(() => {
      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        localStorage.setItem("zetapets-admin", "true")
        router.push("/admin/dashboard")
      } else {
        setError("Usuario o contraseña incorrectos.")
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="admin-sidebar-brand">Zeta<span>Pets</span></span>
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <h1 className="admin-login-title">Acceso al panel</h1>
        <p className="admin-login-sub">Ingresá tus credenciales de administrador</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-user">Usuario</label>
            <input
              id="admin-user"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="admin-pass">Contraseña</label>
            <input
              id="admin-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="admin-login-error">⚠️ {error}</p>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Verificando..." : "Ingresar al panel"}
          </button>
        </form>

        <p className="admin-login-note">
          🔒 Acceso restringido. Solo personal autorizado.
        </p>
      </div>
    </div>
  )
}
