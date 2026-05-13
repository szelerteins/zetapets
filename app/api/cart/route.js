/**
 * API Routes del Carrito
 *
 * POST   /api/cart → validar producto y stock antes de agregar al carrito local
 * PATCH  /api/cart → validar actualización de cantidad
 * DELETE /api/cart → validar eliminación de item
 *
 * El carrito vive en localStorage (CartContext). Estos endpoints solo validan.
 */

import { NextResponse } from "next/server"
import { getProductById, checkStock } from "../../../lib/supabase/services"
import { addToCartSchema, updateCartSchema, removeFromCartSchema, parseSchema } from "../../../lib/validations"

/** POST /api/cart → validar y agregar producto al carrito */
export async function POST(request) {
  try {
    const body = await request.json()
    const { data, errors } = parseSchema(addToCartSchema, body)
    if (errors) {
      return NextResponse.json(
        { error: "Datos inválidos", details: errors },
        { status: 400 }
      )
    }

    const product = await getProductById(data.productId)
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    const hasStock = await checkStock(data.productId, data.quantity)
    if (!hasStock) {
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${product.stock}` },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        quantity: data.quantity,
        selectedVariant: data.selectedVariant ?? null,
        cartKey: data.selectedVariant
          ? `${product.id}-${data.selectedVariant}`
          : String(product.id),
      },
    })
  } catch (err) {
    console.error("[POST /api/cart]", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

/** PATCH /api/cart → validar actualización de cantidad */
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { data, errors } = parseSchema(updateCartSchema, body)
    if (errors) {
      return NextResponse.json(
        { error: "Datos inválidos", details: errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: true, cartKey: data.cartKey, delta: data.delta })
  } catch (err) {
    console.error("[PATCH /api/cart]", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

/** DELETE /api/cart → validar eliminación de item */
export async function DELETE(request) {
  try {
    const body = await request.json()

    if (body?.all === true) {
      return NextResponse.json({ success: true, cleared: true })
    }

    const { data, errors } = parseSchema(removeFromCartSchema, body)
    if (errors) {
      return NextResponse.json(
        { error: "Datos inválidos", details: errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: true, removedKey: data.cartKey })
  } catch (err) {
    console.error("[DELETE /api/cart]", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
