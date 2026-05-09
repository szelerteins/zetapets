/**
 * lib/supabase/server.js
 * Cliente de Supabase para el SERVIDOR (Server Components, Route Handlers, middleware).
 * Usa cookies de Next.js para mantener la sesión del usuario.
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En Server Components de solo lectura el set no tiene efecto,
            // la sesión se refresca en el middleware.
          }
        },
      },
    }
  )
}
