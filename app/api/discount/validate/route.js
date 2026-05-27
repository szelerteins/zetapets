import { NextResponse } from "next/server"
import { createAdminClient } from "../../../../lib/supabase/admin"

export async function POST(request) {
  try {
    const { code } = await request.json()
    if (!code?.trim()) {
      return NextResponse.json({ valid: false, error: "Código requerido" }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ valid: false, error: "Servicio no disponible" }, { status: 500 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("discount_code, discount_expires_at")
      .eq("discount_code", code.trim().toUpperCase())
      .single()

    if (error || !profile) {
      return NextResponse.json({ valid: false, error: "Código inválido" })
    }

    if (!profile.discount_expires_at || new Date(profile.discount_expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "El código está vencido" })
    }

    return NextResponse.json({ valid: true, discount_pct: 10 })
  } catch (err) {
    console.error("[discount/validate]", err.message)
    return NextResponse.json({ valid: false, error: "Error al validar" }, { status: 500 })
  }
}
