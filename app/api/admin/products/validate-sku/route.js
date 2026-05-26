import { NextResponse } from "next/server"
import { cookies } from "next/headers"

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("zetapets-session")?.value === "authenticated"
}

export async function GET(request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const sku = searchParams.get("sku")

  if (!sku?.trim()) return NextResponse.json({ error: "SKU requerido" }, { status: 400 })

  const { validateSKU } = await import("../../../../../lib/sheets")
  const result = await validateSKU(sku.trim())
  return NextResponse.json(result)
}
