/**
 * middleware.js — Protección de rutas en Next.js
 *
 * Este archivo se ejecuta en el SERVIDOR antes de cada request a las rutas
 * definidas en `config.matcher`. Es el lugar correcto para proteger rutas
 * porque corre antes de que el componente se renderice.
 *
 * IMPORTANTE - SEGURIDAD:
 * - Actualmente verifica una cookie simple "zetapets-session=authenticated".
 * - En producción: verificar un JWT firmado con una clave secreta.
 * - Ejemplo con JWT:
 *     import { jwtVerify } from 'jose'
 *     const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
 * - La variable de entorno JWT_SECRET debe estar en .env.local y NUNCA en el código.
 *
 * RUTAS PROTEGIDAS:
 * - /admin/*          → requiere cookie de sesión de admin
 * - /admin/dashboard  → idem
 *
 * RUTAS PÚBLICAS (sin protección):
 * - /login            → página de login (siempre accesible)
 * - /                 → home
 * - /productos        → catálogo público
 * - /carrito          → carrito público
 * - /checkout         → checkout público (cualquiera puede comprar)
 * - /api/*            → los API routes manejan su propia autenticación
 */

import { NextResponse } from "next/server"

/** Cookie que indica sesión de admin activa */
const SESSION_COOKIE = "zetapets-session"

/** Valor esperado de la cookie (en producción: un JWT firmado) */
const SESSION_VALUE = "authenticated"

export function middleware(request) {
  const { pathname } = request.nextUrl

  // ── Proteger rutas /admin/* ───────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(SESSION_COOKIE)
    const isAuthenticated = session?.value === SESSION_VALUE

    // Si ya está autenticado y va a /admin (login page), redirigir al dashboard
    if (isAuthenticated && pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    // Si NO está autenticado y trata de acceder al dashboard, redirigir al login
    if (!isAuthenticated && pathname !== "/admin") {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Si ya está autenticado y va a /login, redirigir al dashboard ──────────
  if (pathname === "/login") {
    const session = request.cookies.get(SESSION_COOKIE)
    if (session?.value === SESSION_VALUE) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

/**
 * Configuración del matcher:
 * Define en qué rutas se ejecuta el middleware.
 * Excluimos assets estáticos (_next, favicon, imágenes) para no procesarlos.
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
  ],
}
