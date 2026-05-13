/**
 * GET /api/products
 * Devuelve el catálogo de productos desde Supabase con filtros opcionales.
 *
 * Query params:
 *   ?category=Alimentación
 *   ?search=collar
 *   ?page=1&limit=20
 */

import { NextResponse } from "next/server"
import { getActiveProducts } from "../../../lib/supabase/services"
import { productQuerySchema, parseSchema } from "../../../lib/validations"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawQuery = {
      category: searchParams.get("category") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 50,
    }

    const { data: query, errors } = parseSchema(productQuerySchema, rawQuery)
    if (errors) {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: errors },
        { status: 400 }
      )
    }

    const products = await getActiveProducts({
      category: query.category,
      search: query.search,
    })

    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort()

    return NextResponse.json({
      data: products,
      categories,
      total: products.length,
      page: query.page,
      limit: query.limit,
    })
  } catch (err) {
    console.error("[GET /api/products]", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
