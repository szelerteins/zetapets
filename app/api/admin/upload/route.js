import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "../../../../lib/supabase/admin"

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("zetapets-session")?.value === "authenticated"
}

export async function POST(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  let formData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })

  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Formato no permitido. Usá JPG, PNG, WEBP o GIF." }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo supera los 5MB" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split(".").pop().toLowerCase()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl })
}
