/**
 * app/auth/callback/route.js
 * Maneja el redirect de confirmación de email de Supabase.
 * Cuando el usuario hace clic en el link del mail, Supabase lo manda acá.
 */

import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") || "/"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Confirmación exitosa → redirigir al home o a la ruta pedida
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla → redirigir al login con error
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
