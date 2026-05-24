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
  const { login, loginWithGoogle } = useAuth()

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
        <p className="auth-sub">Bienvenido de vuelta</p>

        <button
          type="button"
          className="auth-btn-google"
          onClick={loginWithGoogle}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="auth-divider">o</div>

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

          {apiError && <p className="admin-login-error">{apiError}</p>}

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
