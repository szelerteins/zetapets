import { NextResponse } from "next/server"
import { createAdminClient } from "../../../lib/supabase/admin"

function detectDevice(userAgent = "") {
  if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) {
    if (/tablet|ipad/i.test(userAgent)) return "tablet"
    return "mobile"
  }
  return "desktop"
}

export async function POST(request) {
  try {
    const { path, referrer } = await request.json()
    if (!path) return NextResponse.json({ ok: false })

    const supabase = createAdminClient()
    if (!supabase) return NextResponse.json({ ok: false })

    const ua = request.headers.get("user-agent") || ""
    const device = detectDevice(ua)

    await supabase.from("page_views").insert({
      path,
      referrer: referrer || null,
      device,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
