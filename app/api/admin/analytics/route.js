import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "../../../../lib/supabase/admin"

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("zetapets-session")?.value === "authenticated"
}

function getRangeDate(range) {
  const d = new Date()
  const map = { "1d": 1, "7d": 7, "30d": 30, "180d": 180, "365d": 365 }
  d.setDate(d.getDate() - (map[range] || 30))
  return d.toISOString()
}

function getDailyBuckets(range) {
  const days = { "1d": 24, "7d": 7, "30d": 30, "180d": 30, "365d": 12 }[range] || 30
  const buckets = []
  const now = new Date()

  if (range === "1d") {
    // Hourly buckets
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now)
      d.setHours(d.getHours() - i, 0, 0, 0)
      const key = d.toISOString().slice(0, 13) // "2026-05-01T14"
      const label = `${d.getHours().toString().padStart(2,"0")}:00`
      buckets.push({ key, label, visitas: 0 })
    }
  } else if (range === "180d" || range === "365d") {
    // Monthly buckets
    const months = range === "365d" ? 12 : 6
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7) // "2026-05"
      const label = d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" })
      buckets.push({ key, label, visitas: 0 })
    }
  } else {
    // Daily buckets
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
      buckets.push({ key, label, visitas: 0 })
    }
  }
  return buckets
}

export async function GET(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "30d"
  const since = getRangeDate(range)

  // Fetch page views and click events in parallel
  const [{ data: views }, { data: clicks }] = await Promise.all([
    supabase.from("page_views").select("path, device, created_at, session_id, visitor_id, is_new_visitor, time_on_page, scroll_depth, utm_source, utm_medium, utm_campaign, referrer").gte("created_at", since),
    supabase.from("click_events").select("path, x_pct, y_pct, element, created_at").gte("created_at", since).limit(500),
  ])

  const rows = views || []
  const clickRows = clicks || []

  // ── Métricas generales ────────────────────────────────────────────────────
  const totalViews = rows.length
  const totalClicks = clickRows.length

  const today = new Date().toISOString().slice(0, 10)
  const viewsToday = rows.filter(r => r.created_at?.slice(0, 10) === today).length

  // Bounce rate: sessions with only 1 page view
  const sessionPages = {}
  rows.forEach(r => {
    if (r.session_id) sessionPages[r.session_id] = (sessionPages[r.session_id] || 0) + 1
  })
  const sessionIds = Object.keys(sessionPages)
  const bouncedSessions = sessionIds.filter(id => sessionPages[id] === 1).length
  const bounceRate = sessionIds.length > 0 ? Math.round((bouncedSessions / sessionIds.length) * 100) : 0

  // New vs returning visitors
  const newVisitors = rows.filter(r => r.is_new_visitor).length
  const returningVisitors = totalViews - newVisitors

  // Avg time on site (exclude 0s - not yet updated)
  const timesOnPage = rows.filter(r => r.time_on_page > 0).map(r => r.time_on_page)
  const avgTimeOnSite = timesOnPage.length > 0
    ? Math.round(timesOnPage.reduce((a, b) => a + b, 0) / timesOnPage.length)
    : 0

  // Avg scroll depth
  const scrollDepths = rows.filter(r => r.scroll_depth > 0).map(r => r.scroll_depth)
  const avgScrollDepth = scrollDepths.length > 0
    ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
    : 0

  // ── Chart buckets ─────────────────────────────────────────────────────────
  const buckets = getDailyBuckets(range)
  rows.forEach(r => {
    const ts = r.created_at || ""
    let key
    if (range === "1d") key = ts.slice(0, 13)
    else if (range === "180d" || range === "365d") key = ts.slice(0, 7)
    else key = ts.slice(0, 10)
    const bucket = buckets.find(b => b.key === key)
    if (bucket) bucket.visitas++
  })
  const salesByDay = buckets.map(({ label, visitas }) => ({ day: label, visitas }))

  // ── Top páginas ───────────────────────────────────────────────────────────
  const pageCounts = {}
  const pageScrolls = {}
  rows.forEach(r => {
    pageCounts[r.path] = (pageCounts[r.path] || 0) + 1
    if (r.scroll_depth > 0) {
      if (!pageScrolls[r.path]) pageScrolls[r.path] = []
      pageScrolls[r.path].push(r.scroll_depth)
    }
  })
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, visitas]) => {
      const depths = pageScrolls[page] || []
      const avgScroll = depths.length > 0 ? Math.round(depths.reduce((a,b)=>a+b,0)/depths.length) : 0
      return { page, visitas, avgScroll }
    })

  // ── Dispositivos ──────────────────────────────────────────────────────────
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
  rows.forEach(r => { if (deviceCounts[r.device] !== undefined) deviceCounts[r.device]++ })
  const totalDev = totalViews || 1
  const devices = [
    { label: "Desktop", icon: "🖥️", count: deviceCounts.desktop, pct: Math.round(deviceCounts.desktop/totalDev*100), color: "#7C3AED" },
    { label: "Mobile",  icon: "📱", count: deviceCounts.mobile,  pct: Math.round(deviceCounts.mobile /totalDev*100), color: "#5BC0EB" },
    { label: "Tablet",  icon: "📟", count: deviceCounts.tablet,  pct: Math.round(deviceCounts.tablet /totalDev*100), color: "#F59E0B" },
  ]

  // ── Adquisición (fuentes) ─────────────────────────────────────────────────
  const sourceCounts = {}
  rows.forEach(r => {
    let src = "Directo"
    if (r.utm_source) src = r.utm_source
    else if (r.referrer) {
      try {
        const host = new URL(r.referrer).hostname.replace("www.", "")
        if (host.includes("google")) src = "Google"
        else if (host.includes("facebook") || host.includes("instagram")) src = "Redes Sociales"
        else if (host.includes("whatsapp")) src = "WhatsApp"
        else src = host
      } catch { src = "Referido" }
    }
    sourceCounts[src] = (sourceCounts[src] || 0) + 1
  })
  const totalSrc = totalViews || 1
  const sourceColors = ["#7C3AED","#5BC0EB","#F59E0B","#7AC74F","#EF4444","#EC4899","#14B8A6"]
  const acquisition = Object.entries(sourceCounts)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 7)
    .map(([source, count], i) => ({
      source, count,
      pct: Math.round(count/totalSrc*100),
      color: sourceColors[i] || "#9CA3AF",
    }))

  // ── Click heatmap (grid 10x10) ────────────────────────────────────────────
  // Divide viewport into a 10x10 grid and count clicks per cell
  const grid = Array.from({ length: 10 }, () => Array(10).fill(0))
  clickRows.forEach(c => {
    const col = Math.min(Math.floor((c.x_pct || 0) / 10), 9)
    const row = Math.min(Math.floor((c.y_pct || 0) / 10), 9)
    grid[row][col]++
  })
  const maxClicks = Math.max(1, ...grid.flat())

  // Top clicked elements
  const elementCounts = {}
  clickRows.forEach(c => {
    if (c.element) elementCounts[c.element] = (elementCounts[c.element] || 0) + 1
  })
  const topElements = Object.entries(elementCounts)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 8)
    .map(([element, count]) => ({ element, count }))

  return NextResponse.json({
    totalViews, totalClicks, viewsToday,
    bounceRate,
    newVisitors, returningVisitors,
    avgTimeOnSite,
    avgScrollDepth,
    salesByDay,
    topPages,
    devices,
    acquisition,
    heatmap: { grid, maxClicks, topElements },
  })
}
