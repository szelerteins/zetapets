/**
 * lib/supabase/client.js
 * Cliente de Supabase para el NAVEGADOR (Client Components).
 * Se crea una sola instancia (singleton) por sesión del navegador.
 */

import { createBrowserClient } from "@supabase/ssr"

let client = null

/** Devuelve null si las variables de entorno de Supabase no están configuradas */
export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  return client
}

/** Verdadero cuando Supabase está configurado */
export function isSupabaseEnabled() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
