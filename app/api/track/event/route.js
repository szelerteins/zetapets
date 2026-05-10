import { NextResponse } from "next/server"
import { createAdminClient } from "../../../../lib/supabase/admin"

export async function POST(request) {
  try {
    const { path, session_id, x_pct, y_pct, element } = await request.json()
    if (!path) return NextResponse.json({ ok: false })

    const supabase = createAdminClient()
    if (!supabase) return NextResponse.json({ ok: false })

    await supabase.from("click_events").insert({ path, session_id, x_pct, y_pct, element: element?.slice(0, 100) })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }) }
}
