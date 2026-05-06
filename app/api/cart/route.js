/**
 * API Routes del Carrito
 *
 * GET    /api/cart            → obtener carrito (desde body del request)
 * POST   /api/cart            → agregar item
 * PATCH  /api/cart            → actualizar cantidad
 * DELETE /api/cart            → eliminar item o vaciar
 *
 * NOTA ARQUITECTURAL:
 * El carrito actualmente vive en localStorage del cliente (CartContext).
 * Estos endpoints validan los datos antes de que el cliente los use.
 * En el futuro, cuando haya usuarios autenticados, el carrito se guardará
 * en la base de datos asociado al usuario.
 *
 * MIGRACIÓN FUTURA:
 * - Cart guardado en DB: prisma.cart.upsert({ where: { userId }, data: { items } })
 * - El cliente pasa el userId (desde JWT/sesión) y el servidor mantiene el carrito
 */

import { NextResponse } from "next/server"
import { getProductById, checkStock } from "../../../lib/store/products"
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

    // Verificar que el producto existe
    const product = getProductById(data.productId)
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Verificar stock
    const stockCheck = checkStock(data.productId, data.quantity)
    if (!stockCheck.ok) {
      return NextResponse.json(
        { error: stockCheck.error },
        { status: 409 }
      )
    }

    // Retornar el producto validado para que el cliente lo agregue al carrito local
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

    // Si viene { all: true }, vaciar todo el carrito
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
