/**
 * POST /api/auth/login
 * Autenticación de administrador con token de sesión firmado (HMAC-SHA256).
 *
 * La cookie ya no contiene el string literal "authenticated" sino un token
 * firmado del tipo "admin|<timestamp>|<hmac-hex>", que no puede ser forjado
 * sin conocer ADMIN_SESSION_SECRET.
 *
 * Requiere en .env.local / Vercel:
 *   ADMIN_SESSION_SECRET=<string aleatorio de al menos 32 chars>
 *   ADMIN_USERNAME=zetapets
 *   ADMIN_PASSWORD=<contraseña segura>
 *
 * En producción real: mover username/password a variables de entorno o DB.
 */

import { NextResponse } from "next/server"
import { loginSchema, parseSchema } from "../../../../lib/validations"
import { createSessionToken } from "../../../../lib/admin-session"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "zetapets"
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "zetapetsmascotas@gmail.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Zetapetsmascotas452026"

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Body inválido. Se esperaba JSON." },
        { status: 400 }
      )
    }

    const { data, errors } = parseSchema(loginSchema, body)
    if (errors) {
      return NextResponse.json(
        { error: "Datos inválidos", details: errors },
        { status: 400 }
      )
    }

    const isValid =
      (data.username === ADMIN_USERNAME || data.username === ADMIN_EMAIL) &&
      data.password === ADMIN_PASSWORD

    if (!isValid) {
      // Delay para dificultar brute-force
      await new Promise((r) => setTimeout(r, 300))
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      )
    }

    // Generar token firmado con HMAC-SHA256
    const sessionToken = await createSessionToken()

    const response = NextResponse.json({ success: true, message: "Login exitoso" })

    response.cookies.set("zetapets-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    })

    return response
  } catch (err) {
    console.error("[POST /api/auth/login]", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
