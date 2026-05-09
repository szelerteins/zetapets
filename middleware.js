/**
 * middleware.js
 *
 * Maneja dos sistemas de auth en paralelo:
 *
 * 1. Admin (/admin/*)  → cookie zetapets-session (simple, sin Supabase)
 * 2. Clientes (/account, /orders) → sesión Supabase (JWT en cookie)
 *
 * El middleware de Supabase SIEMPRE refresca el token aunque la ruta
 * no esté protegida, para que los Server Components tengan sesión fresca.
 */

import { NextResponse } from "next/server"
import { updateSession } from "./lib/supabase/middleware"

const ADMIN_COOKIE = "zetapets-session"
const ADMIN_VALUE  = "authenticated"

// Rutas que requieren login de cliente (Supabase)
const PROTECTED_CUSTOMER = ["/account", "/orders"]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ── 1. Rutas /admin/* ──────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get(ADMIN_COOKIE)
    const isAdmin = adminSession?.value === ADMIN_VALUE

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
    // Sin Supabase configurado: bloquear rutas protegidas con redirect a login
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
  // Solo aplicar a rutas relevantes (no a todas las páginas)
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/orders/:path*",
  ],
}
