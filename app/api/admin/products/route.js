import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "../../../../lib/supabase/admin"

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("zetapets-session")?.value === "authenticated"
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, price, stock, emoji, badge, is_active")
    .order("category")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { id, is_active } = await request.json()
  const { error } = await supabase.from("products").update({ is_active }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
