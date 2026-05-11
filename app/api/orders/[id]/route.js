import { NextResponse } from "next/server"
import { createAdminClient } from "../../../../lib/supabase/admin"

export async function GET(request, { params }) {
  const { id } = await params
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "No configurado" }, { status: 503 })

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, payment_status, subtotal, total,
      delivery_method, shipping_name, shipping_address, shipping_city,
      shipping_postal_code, shipping_email, created_at,
      order_items ( product_name, product_emoji, quantity, unit_price, total_price, variant )
    `)
    .eq("id", id)
    .single()

  if (error || !data) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
  return NextResponse.json(data)
}
