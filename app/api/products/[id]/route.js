/**
 * GET /api/products/[id]
 * Devuelve un producto por ID.
 *
 * MIGRACIÓN FUTURA: reemplazar getProductById() por prisma.product.findUnique()
 */

import { NextResponse } from "next/server"
import { getProductById } from "../../../../lib/supabase/services"

export async function GET(request, { params }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 })
    }

    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ data: product })
  } catch (err) {
    console.error("[GET /api/products/[id]]", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
