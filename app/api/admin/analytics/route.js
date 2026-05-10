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

  // Traer todas las vistas de los últimos 30 días
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data: views, error } = await supabase
    .from("page_views")
    .select("path, device, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = views || []

  // ── Métricas generales ────────────────────────────────────────────────────
  const totalViews = rows.length

  const today = new Date().toISOString().slice(0, 10)
  const viewsToday = rows.filter(r => r.created_at.slice(0, 10) === today).length

  // ── Vistas por día (últimos 14 días) ─────────────────────────────────────
  const dailyMap = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
    dailyMap[key] = { day: label, visitas: 0 }
  }
  rows.forEach(r => {
    const key = r.created_at.slice(0, 10)
    if (dailyMap[key]) dailyMap[key].visitas++
  })
  const salesByDay = Object.values(dailyMap)

  // ── Top páginas ───────────────────────────────────────────────────────────
  const pageCounts = {}
  rows.forEach(r => {
    pageCounts[r.path] = (pageCounts[r.path] || 0) + 1
  })
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, visitas]) => ({ page, visitas }))

  // ── Dispositivos ──────────────────────────────────────────────────────────
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
  rows.forEach(r => {
    if (deviceCounts[r.device] !== undefined) deviceCounts[r.device]++
  })
  const totalDev = totalViews || 1
  const devices = [
    { label: "Desktop 🖥️",  count: deviceCounts.desktop, pct: Math.round(deviceCounts.desktop / totalDev * 100), color: "#7C3AED" },
    { label: "Mobile 📱",   count: deviceCounts.mobile,  pct: Math.round(deviceCounts.mobile  / totalDev * 100), color: "#5BC0EB" },
    { label: "Tablet 📟",   count: deviceCounts.tablet,  pct: Math.round(deviceCounts.tablet  / totalDev * 100), color: "#F59E0B" },
  ]

  return NextResponse.json({ totalViews, viewsToday, salesByDay, topPages, devices })
}
