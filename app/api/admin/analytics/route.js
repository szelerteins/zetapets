import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("zetapets-session")?.value === "authenticated"
}

function getAnalyticsClient() {
  const credsJson = process.env.GOOGLE_SA_CREDENTIALS
  const propertyId = process.env.GOOGLE_GA_PROPERTY_ID

  if (!credsJson || !propertyId) return null

  try {
    const credentials = JSON.parse(credsJson)
    return {
      client: new BetaAnalyticsDataClient({ credentials }),
      propertyId,
    }
  } catch {
    return null
  }
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const ga = getAnalyticsClient()
  if (!ga) {
    return NextResponse.json({ error: "GA no configurado" }, { status: 503 })
  }

  const { client, propertyId } = ga

  try {
    // Correr todas las queries en paralelo
    const [
      summaryResponse,
      pagesResponse,
      sourcesResponse,
      dailyResponse,
    ] = await Promise.all([

      // Métricas generales (últimos 28 días)
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }),

      // Páginas más vistas
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "averageSessionDuration" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 8,
      }),

      // Fuentes de tráfico
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 6,
      }),

      // Visitas diarias (últimos 14 días)
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "13daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      }),
    ])

    // Parsear métricas generales
    const row = summaryResponse[0]?.rows?.[0]
    const metrics = {
      activeUsers: parseInt(row?.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row?.metricValues?.[1]?.value || "0"),
      pageViews: parseInt(row?.metricValues?.[2]?.value || "0"),
      bounceRate: parseFloat((parseFloat(row?.metricValues?.[3]?.value || "0") * 100).toFixed(1)),
      avgSessionDuration: formatDuration(parseFloat(row?.metricValues?.[4]?.value || "0")),
    }

    // Parsear páginas
    const topPages = (pagesResponse[0]?.rows || []).map(r => ({
      page: r.dimensionValues[0].value,
      visitas: parseInt(r.metricValues[0].value),
      tiempo: formatDuration(parseFloat(r.metricValues[1].value)),
    }))

    // Parsear fuentes
    const sourceRows = sourcesResponse[0]?.rows || []
    const totalSessions = sourceRows.reduce((s, r) => s + parseInt(r.metricValues[0].value), 0)
    const sourceColors = ["#7AC74F", "#5BC0EB", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899"]
    const trafficSources = sourceRows.map((r, i) => {
      const sessions = parseInt(r.metricValues[0].value)
      return {
        source: translateSource(r.dimensionValues[0].value),
        visitas: sessions,
        porcentaje: totalSessions > 0 ? Math.round((sessions / totalSessions) * 100) : 0,
        color: sourceColors[i] || "#9CA3AF",
      }
    })

    // Parsear visitas diarias
    const dailyRows = dailyResponse[0]?.rows || []
    const salesByDay = dailyRows.map(r => {
      const d = r.dimensionValues[0].value // "20260501"
      const label = `${d.slice(6, 8)}/${d.slice(4, 6)}`
      return {
        day: label,
        ventas: parseInt(r.metricValues[0].value),
        usuarios: parseInt(r.metricValues[1].value),
      }
    })

    return NextResponse.json({ metrics, topPages, trafficSources, salesByDay })
  } catch (err) {
    console.error("GA4 API error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

function translateSource(source) {
  const map = {
    "Organic Search": "Búsqueda orgánica",
    "Direct": "Directo",
    "Organic Social": "Redes Sociales",
    "Referral": "Referidos",
    "Paid Search": "Búsqueda paga",
    "Email": "Email",
    "Unassigned": "Sin asignar",
    "Cross-network": "Cross-network",
  }
  return map[source] || source
}
