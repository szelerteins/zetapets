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
    .from("orders")
    .select(`
      id, order_number, status, subtotal, total, payment_method, payment_status, created_at,
      shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_phone, shipping_email,
      delivery_method, ca_tracking_code,
      order_items ( product_name, product_emoji, quantity, unit_price, total_price, variant )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { id, status } = await request.json()
  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
  if (!validStatuses.includes(status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 })

  const { error } = await supabase.from("orders").update({ status }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
