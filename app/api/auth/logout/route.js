/**
 * POST /api/auth/logout
 * Cierra la sesión del administrador borrando la cookie.
 */

import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Sesión cerrada" })

  // Borrar cookie de sesión
  response.cookies.set("zetapets-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expirar inmediatamente
    path: "/",
  })

  return response
}
