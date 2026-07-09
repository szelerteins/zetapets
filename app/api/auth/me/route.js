/**
 * GET /api/auth/me
 * Verifica si el usuario admin tiene sesión activa comprobando la firma del token.
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySessionToken } from "../../../../lib/admin-session"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("zetapets-session")

    const isValid = await verifySessionToken(session?.value)

    if (!isValid) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: process.env.ADMIN_USERNAME || "zetapets",
        role: "admin",
        email: process.env.ADMIN_EMAIL || "zetapetsmascotas@gmail.com",
      },
    })
  } catch (err) {
    console.error("[GET /api/auth/me]", err)
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}
