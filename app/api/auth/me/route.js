/**
 * GET /api/auth/me
 * Verifica si el usuario tiene sesión activa.
 * Útil para que el cliente sepa si está autenticado sin exponer la cookie.
 *
 * FUTURO: decodificar JWT y devolver datos del usuario (id, nombre, rol)
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("zetapets-session")

    if (!session || session.value !== "authenticated") {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // FUTURO: return { authenticated: true, user: { id, name, role } } desde JWT
    return NextResponse.json({
      authenticated: true,
      user: {
        username: "zetapets",
        role: "admin",
        email: "admin@zetapets.com",
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
