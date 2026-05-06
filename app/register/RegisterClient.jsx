"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"
import { registerSchema, parseSchema } from "../../lib/validations"

export default function RegisterClient() {
  const router = useRouter()
  const { register } = useAuth()

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "", confirmPassword: "",
  })
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

    const { data, errors: ve } = parseSchema(registerSchema, form)
    if (ve) { setErrors(ve); return }

    setLoading(true)
    const result = await register(data)
    setLoading(false)

    if (result.ok) {
      router.push("/")
      router.refresh()
    } else {
      if (result.details) setErrors(result.details)
      else setApiError(result.error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link href="/" className="auth-logo">
          <span className="admin-sidebar-brand">Zeta<span>Pets</span></span>
        </Link>

        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-sub">Es gratis y tarda menos de un minuto 🐾</p>

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

          {apiError && <p className="admin-login-error">⚠️ {apiError}</p>}

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
