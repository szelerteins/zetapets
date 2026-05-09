import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "../../../../lib/supabase/admin"

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("zetapets-session")?.value === "authenticated"
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })
  }

  // Fetch data in parallel
  const [
    { data: ordersData },
    { data: profilesData },
    { data: itemsData },
  ] = await Promise.all([
    supabase.from("orders").select("total, status, created_at, payment_method"),
    supabase.from("profiles").select("user_id"),
    supabase.from("order_items").select("product_name, quantity"),
  ])

  const activeOrders = (ordersData || []).filter(o => o.status !== "cancelled")
  const totalOrders = ordersData?.length ?? 0
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgTicket = activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0
  const registeredClients = profilesData?.length ?? 0

  // Status counts
  const statusCounts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 }
  ;(ordersData || []).forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++ })

  // Top product by quantity sold
  const productSales = {}
  ;(itemsData || []).forEach(item => {
    productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity
  })
  const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  // Sales by day (last 14 days)
  const now = new Date()
  const salesByDay = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
    const dayStr = d.toISOString().slice(0, 10)
    const dayOrders = (ordersData || []).filter(o => o.created_at?.slice(0, 10) === dayStr && o.status !== "cancelled")
    salesByDay.push({
      day: label,
      ventas: dayOrders.length,
      facturacion: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
    })
  }

  return NextResponse.json({
    totalOrders,
    totalRevenue,
    avgTicket,
    registeredClients,
    topProduct,
    statusCounts,
    salesByDay,
  })
}
