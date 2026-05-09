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

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, phone, city")
    .order("full_name")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get orders per user
  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, total, status")

  const clients = (profiles || []).map(p => {
    const userOrders = (orders || []).filter(o => o.user_id === p.user_id)
    const activeOrders = userOrders.filter(o => o.status !== "cancelled")
    return {
      user_id: p.user_id,
      nombre: p.full_name || "Sin nombre",
      ciudad: p.city || "—",
      pedidos: userOrders.length,
      gasto: activeOrders.reduce((s, o) => s + (o.total || 0), 0),
      activo: userOrders.length > 0,
    }
  })

  return NextResponse.json(clients)
}
