import { NextResponse } from "next/server"
import { createAdminClient } from "../../../../lib/supabase/admin"

export async function POST(request) {
  try {
    const { path, session_id, time_on_page, scroll_depth } = await request.json()
    if (!path || !session_id) return NextResponse.json({ ok: false })

    const supabase = createAdminClient()
    if (!supabase) return NextResponse.json({ ok: false })

    // Update the most recent page_view for this session+path
    const { data } = await supabase
      .from("page_views")
      .select("id")
      .eq("session_id", session_id)
      .eq("path", path)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (data?.id) {
      await supabase.from("page_views").update({ time_on_page, scroll_depth }).eq("id", data.id)
    }

    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }) }
}
