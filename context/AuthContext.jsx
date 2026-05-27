"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "../lib/supabase/client"

const AuthContext = createContext()

function translateAuthError(msg) {
  if (!msg) return "Error desconocido"
  if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos"
  if (msg.includes("Email not confirmed"))        return "Confirmá tu email antes de ingresar. Revisá tu carpeta de spam."
  if (msg.includes("User already registered"))    return "Ya existe una cuenta con ese email"
  if (msg.includes("Password should be"))        return "La contraseña debe tener al menos 6 caracteres"
  if (msg.includes("rate limit") || msg.includes("too many")) return "Demasiados intentos. Esperá unos minutos e intentá de nuevo."
  if (msg.includes("network") || msg.includes("fetch"))       return "Error de conexión. Verificá tu internet."
  return msg
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cliente lazy: solo se crea cuando Supabase está configurado
  const getClient = useCallback(() => createClient(), [])

  const loadProfile = useCallback(async (supabase, userId) => {
    if (!supabase || !userId) { setProfile(null); setIsAdmin(false); return }
    const [{ data: profileData }, { data: adminData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("admin_users").select("user_id").eq("user_id", userId).single(),
    ])
    setProfile(profileData ?? null)
    setIsAdmin(!!adminData)
  }, [])

  useEffect(() => {
    const supabase = getClient()

    if (!supabase) {
      // Supabase no configurado: sin auth
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadProfile(supabase, session?.user?.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        loadProfile(supabase, session?.user?.id)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [getClient, loadProfile])

  async function login(email, password) {
    try {
      const supabase = getClient()
      if (!supabase) return { ok: false, error: "Supabase no está configurado aún" }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, error: translateAuthError(error.message) }
      setUser(data.user)
      await loadProfile(supabase, data.user?.id)
      return { ok: true }
    } catch (e) {
      console.error("[login]", e)
      return { ok: false, error: "Error de conexión. Intentá de nuevo." }
    }
  }

  async function register({ nombre, apellido, email, password, petBirthday, birthdayEmailConsent }) {
    try {
      const supabase = getClient()
      if (!supabase) return { ok: false, error: "Supabase no está configurado aún" }

      const redirectTo = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined

      // Guardamos birthday en metadata para que el trigger lo persista
      // incluso cuando se requiere confirmación de email
      const metadata = { full_name: `${nombre} ${apellido}` }
      if (petBirthday) {
        metadata.pet_birthday = petBirthday
        metadata.birthday_email_consent = String(!!birthdayEmailConsent)
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo, data: metadata },
      })

      if (error) return { ok: false, error: translateAuthError(error.message) }

      // Si no hay sesión → confirmación de email requerida
      if (!data.session) {
        return { ok: true, confirmationRequired: true, email }
      }

      // Si hay sesión (confirmación deshabilitada) → login automático
      if (data.user) {
        const profileData = {
          user_id:   data.user.id,
          full_name: `${nombre} ${apellido}`,
        }
        if (petBirthday) {
          profileData.pet_birthday           = petBirthday
          profileData.birthday_email_consent = !!birthdayEmailConsent
        }
        await supabase.from("profiles").upsert(profileData, { onConflict: "user_id" })
        setUser(data.user)
        await loadProfile(supabase, data.user.id)
      }
      return { ok: true, user: data.user }
    } catch (e) {
      console.error("[register]", e)
      return { ok: false, error: "Error de conexión. Intentá de nuevo." }
    }
  }

  async function loginWithGoogle() {
    try {
      const supabase = getClient()
      if (!supabase) return { ok: false, error: "Supabase no está configurado aún" }
      const redirectTo = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })
      if (error) return { ok: false, error: translateAuthError(error.message) }
      return { ok: true }
    } catch (e) {
      console.error("[loginWithGoogle]", e)
      return { ok: false, error: "Error de conexión. Intentá de nuevo." }
    }
  }

  async function logout() {
    const supabase = getClient()
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
  }

  async function refreshProfile() {
    const supabase = getClient()
    if (user && supabase) await loadProfile(supabase, user.id)
  }

  const userForHeader = user
    ? {
        ...user,
        nombre:   profile?.full_name?.split(" ")[0] ?? user.email.split("@")[0],
        apellido: profile?.full_name?.split(" ").slice(1).join(" ") ?? "",
        email:    user.email,
      }
    : null

  return (
    <AuthContext.Provider value={{ user: userForHeader, rawUser: user, profile, isAdmin, loading, login, register, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
