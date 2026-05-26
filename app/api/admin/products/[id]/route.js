import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "../../../../../lib/supabase/admin"

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("zetapets-session")?.value === "authenticated"
}

export async function GET(request, { params }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { id } = await params
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request, { params }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { id } = await params
  const body = await request.json()
  const {
    name, description, price, category, sku, stock,
    emoji, badge, variants, features, images, color_variants, is_active,
  } = body

  if (!name || !price || !category) {
    return NextResponse.json({ error: "Nombre, precio y categoría son requeridos" }, { status: 400 })
  }

  const cleanFeatures = (features || []).filter(f => f && f.trim() && f !== "N/A")
  const cleanVariants = (variants || []).filter(v => v && v.trim())
  const cleanImages = (images || []).filter(u => u && u.trim())

  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      description,
      price: Number(price),
      category,
      sku,
      stock: Number(stock) || 0,
      emoji,
      badge: badge || null,
      variants: cleanVariants.length ? cleanVariants : null,
      features: cleanFeatures.length ? cleanFeatures : null,
      images: cleanImages.length ? cleanImages : null,
      image_url: cleanImages[0] || null,
      color_variants: color_variants?.length ? color_variants : null,
      is_active: is_active !== false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request, { params }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { id } = await params
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
