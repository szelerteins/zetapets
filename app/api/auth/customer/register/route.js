import { NextResponse } from "next/server"
import { createUser, publicUser } from "../../../../../lib/store/users"
import { registerSchema, parseSchema } from "../../../../../lib/validations"

export async function POST(request) {
  try {
    const body = await request.json()
    const { data, errors } = parseSchema(registerSchema, body)
    if (errors) {
      return NextResponse.json({ error: "Datos inválidos", details: errors }, { status: 400 })
    }

    const result = createUser(data)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    const response = NextResponse.json({
      success: true,
      user: publicUser(result.user),
      message: "Cuenta creada exitosamente",
    })
    response.cookies.set("zetapets-customer", String(result.user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return response
  } catch (err) {
    console.error("[POST /api/auth/customer/register]", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
