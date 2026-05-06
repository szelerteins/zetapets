import { NextResponse } from "next/server"
import { findUserByEmail, verifyPassword, publicUser } from "../../../../../lib/store/users"
import { customerLoginSchema, parseSchema } from "../../../../../lib/validations"

export async function POST(request) {
  try {
    const body = await request.json()
    const { data, errors } = parseSchema(customerLoginSchema, body)
    if (errors) {
      return NextResponse.json({ error: "Datos inválidos", details: errors }, { status: 400 })
    }

    const user = findUserByEmail(data.email)
    if (!user || !verifyPassword(user, data.password)) {
      await new Promise((r) => setTimeout(r, 300))
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true, user: publicUser(user) })
    response.cookies.set("zetapets-customer", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    })
    return response
  } catch (err) {
    console.error("[POST /api/auth/customer/login]", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
