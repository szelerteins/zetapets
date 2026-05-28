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

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, price, stock, emoji, badge, is_active, sku, images, image_url, variants, color_variants")
    .order("category")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const body = await request.json()
  const { name, description, price, stock, category, emoji, badge, image_url, variants, color_variants, is_active } = body

  if (!name || !price || !category) {
    return NextResponse.json({ error: "Nombre, precio y categoría son obligatorios" }, { status: 400 })
  }

  const cleanVariants = (variants || []).filter(v => v && v.trim())
  const cleanColors = (color_variants || []).filter(c => c?.color)

  const { data, error } = await supabase.from("products").insert({
    name, description, price: Number(price), stock: Number(stock ?? 0),
    category, emoji, badge: badge || null, image_url: image_url || null,
    variants: cleanVariants.length ? cleanVariants : null,
    color_variants: cleanColors.length ? cleanColors : [],
    is_active: is_active !== false,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const body = await request.json()
  const { id, name, description, price, stock, category, emoji, badge, image_url, variants, color_variants, is_active } = body

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  const cleanVariants = (variants || []).filter(v => v && v.trim())
  const cleanColors = (color_variants || []).filter(c => c?.color)

  const { error } = await supabase.from("products").update({
    name, description, price: Number(price), stock: Number(stock ?? 0),
    category, emoji, badge: badge || null, image_url: image_url || null,
    variants: cleanVariants.length ? cleanVariants : null,
    color_variants: cleanColors.length ? cleanColors : [],
    is_active,
    updated_at: new Date().toISOString(),
  }).eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { id, is_active } = await request.json()
  const { error } = await supabase.from("products").update({ is_active }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
