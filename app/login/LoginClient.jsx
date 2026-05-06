"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"
import { customerLoginSchema, parseSchema } from "../../lib/validations"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const { login } = useAuth()

  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
    setApiError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError("")

    const { data, errors: ve } = parseSchema(customerLoginSchema, form)
    if (ve) { setErrors(ve); return }

    setLoading(true)
    const result = await login(data.email, data.password)
    setLoading(false)

    if (result.ok) {
      router.push(redirectTo)
      router.refresh()
    } else {
      setApiError(result.error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <span className="admin-sidebar-brand">Zeta<span>Pets</span></span>
        </Link>

        <h1 className="auth-title">Iniciar sesión</h1>
        <p className="auth-sub">Bienvenido de vuelta 👋</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="tu@email.com" autoComplete="email"
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="••••••••" autoComplete="current-password"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {apiError && <p className="admin-login-error">⚠️ {apiError}</p>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <p className="auth-switch">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="auth-link">Registrate gratis</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginClient() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="auth-card">Cargando...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
