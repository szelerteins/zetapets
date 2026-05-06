import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { findUserById, publicUser } from "../../../../../lib/store/users"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const customerCookie = cookieStore.get("zetapets-customer")

    if (!customerCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = findUserById(customerCookie.value)
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, user: publicUser(user) })
  } catch (err) {
    console.error("[GET /api/auth/customer/me]", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
