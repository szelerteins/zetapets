import { NextResponse } from "next/server"
import { createAdminClient } from "../../../lib/supabase/admin"

function detectDevice(ua = "") {
  if (/tablet|ipad/i.test(ua)) return "tablet"
  if (/mobile|android|iphone/i.test(ua)) return "mobile"
  return "desktop"
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { path, referrer, session_id, visitor_id, is_new_visitor, utm_source, utm_medium, utm_campaign } = body
    if (!path) return NextResponse.json({ ok: false })

    const supabase = createAdminClient()
    if (!supabase) return NextResponse.json({ ok: false })

    const ua = request.headers.get("user-agent") || ""
    await supabase.from("page_views").insert({
      path, referrer: referrer || null,
      device: detectDevice(ua),
      session_id: session_id || null,
      visitor_id: visitor_id || null,
      is_new_visitor: is_new_visitor ?? true,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    })

    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }) }
}
