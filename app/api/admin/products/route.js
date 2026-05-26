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
    .select("id, name, category, price, stock, emoji, badge, is_active, sku, images, image_url")
    .order("category")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const body = await request.json()
  const {
    name, description, price, category, sku, stock,
    emoji, badge, variants, features, images, color_variants, is_active,
  } = body

  if (!name || !price || !category || !sku) {
    return NextResponse.json({ error: "Nombre, precio, categoría y SKU son requeridos" }, { status: 400 })
  }

  // Validate SKU against Google Sheet (lazy import to avoid googleapis at module level)
  const { validateSKU } = await import("../../../../lib/sheets")
  const skuCheck = await validateSKU(sku)
  if (!skuCheck.valid) {
    return NextResponse.json({ error: skuCheck.error }, { status: 400 })
  }

  const cleanFeatures = (features || []).filter(f => f && f.trim() && f !== "N/A")
  const cleanVariants = (variants || []).filter(v => v && v.trim())
  const cleanImages = (images || []).filter(u => u && u.trim())

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      description,
      price: Number(price),
      category,
      sku,
      stock: stock !== undefined ? Number(stock) : skuCheck.stockActual,
      emoji,
      badge: badge || null,
      variants: cleanVariants.length ? cleanVariants : null,
      features: cleanFeatures.length ? cleanFeatures : null,
      images: cleanImages.length ? cleanImages : null,
      image_url: cleanImages[0] || null,
      color_variants: color_variants?.length ? color_variants : null,
      is_active: is_active !== false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
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
