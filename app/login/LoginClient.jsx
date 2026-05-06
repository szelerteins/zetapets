"use client"

/**
 * LoginClient.jsx — Formulario de login del administrador
 *
 * PROVISORIO:
 * - Llama a /api/auth/login con usuario y contraseña.
 * - El endpoint setea una cookie httpOnly en el servidor.
 * - El middleware protege /admin/* verificando esa cookie.
 *
 * PRODUCCIÓN FUTURA:
 * - Usar NextAuth.js: npm install next-auth
 * - O Auth.js con Credentials provider + bcrypt para comparar contraseñas
 * - El JWT debe firmarse con process.env.AUTH_SECRET (nunca en el código)
 */

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { loginSchema, parseSchema } from "../../lib/validations"
import { Suspense } from "react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/admin/dashboard"

  const [form, setForm]     = useState({ username: "", password: "" })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")
  const [loading, setLoading]   = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Limpiar error del campo al escribir
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError("")

    // Validar con Zod en el cliente también (doble validación)
    const { data, errors: validationErrors } = parseSchema(loginSchema, form)
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setApiError(json.error || "Error al iniciar sesión")
        return
      }

      // Login exitoso → redirigir (el middleware ya tiene la cookie)
      router.push(redirectTo)
      router.refresh()
    } catch {
      setApiError("Error de conexión. Intentá nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Logo */}
        <div className="admin-login-logo">
          <span className="admin-sidebar-brand">
            Zeta<span>Pets</span>
          </span>
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <h1 className="admin-login-title">Iniciar sesión</h1>
        <p className="admin-login-sub">
          Acceso restringido al panel de administrador
        </p>

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          {/* Usuario */}
          <div className="admin-form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="zetapets"
              autoComplete="username"
              disabled={loading}
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>

          {/* Contraseña */}
          <div className="admin-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {/* Error de API */}
          {apiError && (
            <p className="admin-login-error">⚠️ {apiError}</p>
          )}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Ingresar →"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link
            href="/"
            style={{ fontSize: "0.82rem", color: "#6B7280", textDecoration: "underline" }}
          >
            ← Volver al sitio
          </Link>
        </div>

        <p className="admin-login-note">
          🔒 Solo personal autorizado. La sesión expira en 24 horas.
        </p>
      </div>
    </div>
  )
}

export default function LoginClient() {
  return (
    <Suspense fallback={<div className="admin-login-page"><div className="admin-login-card">Cargando...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
