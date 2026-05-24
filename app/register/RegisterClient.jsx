"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"
import { registerSchema, parseSchema } from "../../lib/validations"
import { MdOutlineMarkEmailRead } from "react-icons/md"

export default function RegisterClient() {
  const router = useRouter()
  const { register, loginWithGoogle } = useAuth()

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "", confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState("")

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
    setApiError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError("")

    const { data, errors: ve } = parseSchema(registerSchema, form)
    if (ve) { setErrors(ve); return }

    setLoading(true)
    const result = await register(data)
    setLoading(false)

    if (result.ok) {
      if (result.confirmationRequired) {
        setConfirmEmail(result.email)
      } else {
        router.push("/")
        router.refresh()
      }
    } else {
      if (result.details) setErrors(result.details)
      else setApiError(result.error)
    }
  }

  // Pantalla de confirmación pendiente
  if (confirmEmail) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="confirm-email-icon"><MdOutlineMarkEmailRead size={56} style={{ color: "var(--celeste-dark)", margin: "0 auto" }} /></div>
          <h1 className="auth-title">¡Revisá tu email!</h1>
          <p className="auth-sub">
            Te enviamos un link de confirmación a
          </p>
          <p className="confirm-email-address">{confirmEmail}</p>
          <p className="confirm-email-hint">
            Hacé clic en el link del mail para activar tu cuenta. <br />
            Si no lo ves, revisá la carpeta de spam.
          </p>
          <Link href="/login" className="admin-login-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 24 }}>
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link href="/" className="auth-logo">
          <span className="admin-sidebar-brand">Zeta<span>Pets</span></span>
        </Link>

        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-sub">Es gratis y tarda menos de un minuto</p>

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
          Registrarse con Google
        </button>

        <div className="auth-divider">o</div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-grid-2">
            <div className="admin-form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre" name="nombre" type="text"
                value={form.nombre} onChange={handleChange}
                placeholder="Juan" autoComplete="given-name"
                disabled={loading}
              />
              {errors.nombre && <span className="field-error">{errors.nombre}</span>}
            </div>

            <div className="admin-form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido" name="apellido" type="text"
                value={form.apellido} onChange={handleChange}
                placeholder="Pérez" autoComplete="family-name"
                disabled={loading}
              />
              {errors.apellido && <span className="field-error">{errors.apellido}</span>}
            </div>
          </div>

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

          <div className="auth-grid-2">
            <div className="admin-form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password" name="password" type="password"
                value={form.password} onChange={handleChange}
                placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                disabled={loading}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="admin-form-group">
              <label htmlFor="confirmPassword">Repetir contraseña</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                value={form.confirmPassword} onChange={handleChange}
                placeholder="••••••••" autoComplete="new-password"
                disabled={loading}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          {apiError && <p className="admin-login-error">{apiError}</p>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="auth-link">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
