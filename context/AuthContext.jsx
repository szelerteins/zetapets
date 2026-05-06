"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar sesión al cargar
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/customer/me")
      if (res.ok) {
        const json = await res.json()
        setUser(json.user || null)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  async function login(email, password) {
    const res = await fetch("/api/auth/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (res.ok) {
      setUser(json.user)
      return { ok: true }
    }
    return { ok: false, error: json.error || "Error al iniciar sesión" }
  }

  async function register(datos) {
    const res = await fetch("/api/auth/customer/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    })
    const json = await res.json()
    if (res.ok) {
      setUser(json.user)
      return { ok: true }
    }
    return { ok: false, error: json.error, details: json.details }
  }

  async function logout() {
    await fetch("/api/auth/customer/logout", { method: "POST" })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
