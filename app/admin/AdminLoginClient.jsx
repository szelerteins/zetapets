"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginClient() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError("Completá todos los campos")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (res.ok) {
        router.push("/admin/dashboard")
        router.refresh()
      } else {
        setError(json.error || "Credenciales incorrectas")
      }
    } catch {
      setError("Error de conexión. Intentá nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="admin-sidebar-brand">Zeta<span>Pets</span></span>
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <h1 className="admin-login-title">Panel de administración</h1>
        <p className="admin-login-sub">Acceso restringido. Solo personal autorizado.</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username" name="username" type="text"
              value={form.username} onChange={handleChange}
              placeholder="zetapets" autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="••••••••" autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <p className="admin-login-error">⚠️ {error}</p>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Verificando..." : "Ingresar al panel"}
          </button>
        </form>

        <p className="admin-login-note">🔒 Sesión expira en 24 horas.</p>
      </div>
    </div>
  )
}
