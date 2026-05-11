import { NextResponse } from "next/server"
import { getMercadoPagoClient, Preference } from "../../../../lib/mercadopago"
import { createAdminClient } from "../../../../lib/supabase/admin"
import { getShippingCost, PICKUP_INFO } from "../../../../lib/shipping-zones"

export async function POST(request) {
  try {
    const { items, buyer, cartTotal, deliveryMethod = "shipping" } = await request.json()

    if (!items?.length || !buyer?.email) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const isPickup     = deliveryMethod === "pickup"
    const shippingCost = getShippingCost(buyer.codigoPostal, cartTotal, deliveryMethod)

    const client     = getMercadoPagoClient()
    const preference = new Preference(client)

    const supabase    = createAdminClient()
    let orderId       = null
    let orderNumber   = "ZP-" + Math.floor(100000 + Math.random() * 900000)

    if (supabase) {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_number:         orderNumber,
          status:               "pending",
          payment_status:       "pending",
          subtotal:             cartTotal,
          tax:                  0,
          total:                cartTotal + shippingCost,
          shipping_cost:        shippingCost,
          payment_method:       "mercadopago",
          delivery_method:      deliveryMethod,
          shipping_name:        `${buyer.nombre} ${buyer.apellido}`,
          shipping_address:     isPickup ? PICKUP_INFO.address : (buyer.direccion || null),
          shipping_city:        isPickup ? PICKUP_INFO.zone    : (buyer.ciudad    || null),
          shipping_phone:       buyer.telefono,
          shipping_postal_code: isPickup ? null : (buyer.codigoPostal || null),
          shipping_email:       buyer.email,
        })
        .select()
        .single()

      if (!error && order) {
        orderId = order.id
        const orderItems = items.map((item) => ({
          order_id:      order.id,
          product_name:  item.name,
          product_emoji: item.emoji ?? null,
          quantity:      item.quantity,
          unit_price:    item.price,
          total_price:   item.price * item.quantity,
          variant:       item.selectedVariant ?? null,
        }))
        await supabase.from("order_items").insert(orderItems)
      }
    }

    // Construir ítems para MercadoPago
    const mpItems = items.map((item) => ({
      id:          String(item.id),
      title:       item.name + (item.selectedVariant ? ` (${item.selectedVariant})` : ""),
      quantity:    item.quantity,
      unit_price:  Math.max(item.price, 1), // MP requiere mínimo 1
      currency_id: "ARS",
    }))

    if (shippingCost > 0) {
      mpItems.push({
        id:          "shipping",
        title:       "Envío a domicilio",
        quantity:    1,
        unit_price:  shippingCost,
        currency_id: "ARS",
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name:    buyer.nombre,
          surname: buyer.apellido,
          email:   buyer.email,
          phone:   { number: buyer.telefono },
          address: {
            street_name: isPickup ? "Retiro en local" : (buyer.direccion || ""),
            zip_code:    isPickup ? ""                : (buyer.codigoPostal || ""),
          },
        },
        back_urls: {
          success: `${appUrl}/confirmacion?status=approved&order_id=${orderId || ""}`,
          failure: `${appUrl}/confirmacion?status=failure&order_id=${orderId || ""}`,
          pending: `${appUrl}/confirmacion?status=pending&order_id=${orderId || ""}`,
        },
        ...(appUrl.startsWith("https") ? { auto_return: "approved" } : {}),
        notification_url:     `${appUrl}/api/payments/webhook`,
        external_reference:   orderId ? String(orderId) : orderNumber,
        statement_descriptor: "ZETAPETS",
      },
    })

    return NextResponse.json({
      init_point:   result.init_point,
      order_id:     orderId,
      order_number: orderNumber,
    })
  } catch (err) {
    console.error("Error creando preference MP:", err)
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}
