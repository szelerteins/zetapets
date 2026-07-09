/**
 * POST /api/payments/webhook
 *
 * Webhook de Mercado Pago. Recibe notificaciones de cambios en el estado de un pago
 * y actualiza la orden en Supabase según el estado recibido.
 *
 * Estados manejados:
 *   approved    → confirmed / paid       (notifica por WhatsApp y email)
 *   pending     → pending  / pending
 *   in_process  → pending  / pending
 *   authorized  → pending  / pending
 *   rejected    → cancelled / rejected
 *   cancelled   → cancelled / cancelled
 *   refunded    → cancelled / refunded
 *   charged_back→ cancelled / refunded
 *
 * Estados desconocidos o tipo de evento distinto a "payment" se ignoran con 200 OK.
 */

import { NextResponse } from "next/server"
import { getMercadoPagoClient, Payment } from "../../../../lib/mercadopago"
import { createAdminClient } from "../../../../lib/supabase/admin"
import { orderConfirmationTemplate } from "../../../../lib/email-templates"
import { appendWebSale, decrementStockVentas } from "../../../../lib/sheets"
import nodemailer from "nodemailer"

// Mapa de estados de pago MP → estado interno de la orden
const STATUS_MAP = {
  approved:     { status: "confirmed",  payment_status: "paid" },
  pending:      { status: "pending",    payment_status: "pending" },
  in_process:   { status: "pending",    payment_status: "pending" },
  authorized:   { status: "pending",    payment_status: "pending" },
  rejected:     { status: "cancelled",  payment_status: "rejected" },
  cancelled:    { status: "cancelled",  payment_status: "cancelled" },
  refunded:     { status: "cancelled",  payment_status: "refunded" },
  charged_back: { status: "cancelled",  payment_status: "refunded" },
}

async function sendWhatsApp(text) {
  const phone  = process.env.CALLMEBOT_PHONE
  const apikey = process.env.CALLMEBOT_APIKEY
  if (!phone || !apikey) return
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apikey}`
  await fetch(url).catch((err) => console.error("[WhatsApp] Error:", err.message))
}

async function sendConfirmationEmail({ order, items }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  })

  await transporter.sendMail({
    from:    `"ZetaPets" <${process.env.GMAIL_USER}>`,
    to:      order.shipping_email,
    subject: `✅ Pedido confirmado ${order.order_number} - ZetaPets`,
    html:    orderConfirmationTemplate({ order, items }),
  })
}

async function registerSaleInSheets(supabase, order) {
  try {
    const { data: orderFull } = await supabase
      .from("orders")
      .select("*, order_items(*, products(sku))")
      .eq("id", order.id)
      .single()

    if (!orderFull?.order_items?.length) return

    const fecha   = new Date().toLocaleDateString("es-AR")
    const orderId = orderFull.order_number || orderFull.id

    for (const item of orderFull.order_items) {
      const sku = item.products?.sku || null
      await appendWebSale({
        fecha,
        orderId,
        sku,
        nombre:        item.product_name,
        variante:      item.variant || "",
        cantidad:      item.quantity,
        precioUnitario:item.unit_price,
        total:         item.total_price,
      })
      if (sku) await decrementStockVentas(sku, item.quantity)
    }
  } catch (err) {
    console.error("[Sheets] Error registrando venta web:", err.message)
  }
}

export async function POST(request) {
  try {
    // Parsear body con protección contra payload inválido
    let body
    try {
      body = await request.json()
    } catch {
      // MP a veces envía pings vacíos; responder 200 para que no reintente
      return NextResponse.json({ ok: true })
    }

    // Solo procesar notificaciones de tipo "payment" con id presente
    if (!body || body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    // Obtener detalles del pago desde la API de MP
    const client     = getMercadoPagoClient()
    const paymentApi = new Payment(client)
    let payment
    try {
      payment = await paymentApi.get({ id: body.data.id })
    } catch (err) {
      console.error("[Webhook] Error obteniendo pago MP:", err.message)
      return NextResponse.json({ ok: true })
    }

    const mpStatus = payment.status
    const mapping  = STATUS_MAP[mpStatus]

    // Estado desconocido o no relevante → ignorar
    if (!mapping) {
      console.log(`[Webhook] Estado desconocido de MP: ${mpStatus} — ignorado`)
      return NextResponse.json({ ok: true })
    }

    const supabase = createAdminClient()
    if (!supabase) return NextResponse.json({ ok: true })

    // Buscar la orden por external_reference
    const externalRef = payment.external_reference
    let query = supabase.from("orders").select("*, order_items(*)")

    if (externalRef && externalRef.startsWith("ZP-")) {
      query = query.eq("order_number", externalRef)
    } else {
      query = query.eq("id", externalRef)
    }

    const { data: order } = await query.single()
    if (!order) return NextResponse.json({ ok: true })

    // Evitar actualizar si ya está en el mismo estado de pago
    if (order.payment_status === mapping.payment_status) {
      return NextResponse.json({ ok: true })
    }

    // Actualizar estado en Supabase
    await supabase
      .from("orders")
      .update({
        status:                 mapping.status,
        payment_status:         mapping.payment_status,
        mercadopago_payment_id: String(payment.id),
      })
      .eq("id", order.id)

    console.log(`[Webhook] Orden ${order.order_number} → ${mapping.status} / ${mapping.payment_status}`)

    // Solo para pagos aprobados: notificación WhatsApp, email y Sheets
    if (mpStatus === "approved") {
      try {
        const resumen = (order.order_items || [])
          .map((i) => `${i.product_name} x${i.quantity}`)
          .join(", ")
        await sendWhatsApp(
          `🐾 Nueva venta Web\n📦 ${order.order_number}\n🏷 ${resumen}\n💰 $${payment.transaction_amount}`
        )
      } catch (waErr) {
        console.error("[WhatsApp] Error:", waErr.message)
      }

      registerSaleInSheets(supabase, order).catch((err) =>
        console.error("[Sheets] Error asíncrono:", err.message)
      )

      try {
        await sendConfirmationEmail({ order, items: order.order_items || [] })
      } catch (emailErr) {
        console.error("[Email] Error enviando confirmación:", emailErr.message)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    // Siempre responder 200 para que MP no reintente por un error nuestro
    console.error("[Webhook] Error inesperado:", err)
    return NextResponse.json({ ok: true })
  }
}
