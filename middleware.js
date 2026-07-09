/**
 * middleware.js
 *
 * Maneja dos sistemas de auth en paralelo:
 *
 * 1. Admin (/admin/*)  → cookie zetapets-session con token HMAC-SHA256 firmado
 * 2. Clientes (/account, /orders) → sesión Supabase (JWT en cookie)
 *
 * El token de admin ya no es el string literal "authenticated" sino un token
 * firmado que no puede ser forjado sin conocer ADMIN_SESSION_SECRET.
 */

import { NextResponse } from "next/server"
import { updateSession } from "./lib/supabase/middleware"
import { verifySessionToken } from "./lib/admin-session"

// Rutas que requieren login de cliente (Supabase)
const PROTECTED_CUSTOMER = ["/account", "/orders"]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ── 1. Rutas /admin/* ──────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("zetapets-session")
    const isAdmin = await verifySessionToken(adminSession?.value)

    if (isAdmin && pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    if (!isAdmin && pathname !== "/admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.next()
  }

  // ── 2. Refrescar sesión Supabase (solo si las vars están configuradas) ──
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isProtected = PROTECTED_CUSTOMER.some((p) => pathname.startsWith(p))

  if (!hasSupabase) {
    if (isProtected) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request)

  // ── 3. Rutas protegidas de cliente ────────────────────────
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/orders/:path*",
  ],
}
