/**
 * middleware.js — Protección de rutas
 *
 * Separa claramente:
 * - /admin      → login del ADMINISTRADOR (cookie: zetapets-session)
 * - /login      → login de CLIENTES (cookie: zetapets-customer)
 * - /register   → registro de clientes
 *
 * SEGURIDAD:
 * - Verifica cookies httpOnly (no manipulables desde JS del cliente).
 * - En producción: verificar JWT firmado con process.env.JWT_SECRET
 *   usando: import { jwtVerify } from 'jose'
 */

import { NextResponse } from "next/server"

const ADMIN_COOKIE    = "zetapets-session"
const ADMIN_VALUE     = "authenticated"

export function middleware(request) {
  const { pathname } = request.nextUrl
  const adminSession = request.cookies.get(ADMIN_COOKIE)
  const isAdmin = adminSession?.value === ADMIN_VALUE

  // ── Rutas /admin/* ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Si ya está logueado y va a /admin (la página de login del admin), redirigir al dashboard
    if (isAdmin && pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    // Si no está logueado e intenta acceder a subrutas del admin → a /admin
    if (!isAdmin && pathname !== "/admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
