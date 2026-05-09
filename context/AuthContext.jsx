"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "../lib/supabase/client"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cliente lazy: solo se crea cuando Supabase está configurado
  const getClient = useCallback(() => createClient(), [])

  const loadProfile = useCallback(async (supabase, userId) => {
    if (!supabase || !userId) { setProfile(null); return }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single()
    setProfile(data ?? null)
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
    const supabase = getClient()
    if (!supabase) return { ok: false, error: "Supabase no está configurado aún" }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    setUser(data.user)
    await loadProfile(supabase, data.user.id)
    return { ok: true }
  }

  async function register({ nombre, apellido, email, password }) {
    const supabase = getClient()
    if (!supabase) return { ok: false, error: "Supabase no está configurado aún" }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: `${nombre} ${apellido}` } },
    })
    if (error) return { ok: false, error: error.message }
    if (data.user) {
      await supabase.from("profiles").upsert({
        user_id:   data.user.id,
        full_name: `${nombre} ${apellido}`,
      }, { onConflict: "user_id" })
      setUser(data.user)
      await loadProfile(supabase, data.user.id)
    }
    return { ok: true, user: data.user }
  }

  async function logout() {
    const supabase = getClient()
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
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
    <AuthContext.Provider value={{ user: userForHeader, rawUser: user, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
