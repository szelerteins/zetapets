import { NextResponse } from "next/server"
import { getMercadoPagoClient, Payment } from "../../../../lib/mercadopago"
import { createAdminClient } from "../../../../lib/supabase/admin"
import { orderConfirmationTemplate } from "../../../../lib/email-templates"
import nodemailer from "nodemailer"

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

export async function POST(request) {
  try {
    const body = await request.json()

    // MP envía tipo "payment" cuando se procesa un pago
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    const client = getMercadoPagoClient()
    const paymentApi = new Payment(client)
    const payment = await paymentApi.get({ id: body.data.id })

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const supabase = createAdminClient()
    if (!supabase) return NextResponse.json({ ok: true })

    // Buscar la orden por external_reference (puede ser el ID de Supabase)
    const externalRef = payment.external_reference
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")

    // external_reference puede ser UUID o ZP-XXXXXX
    if (externalRef && externalRef.includes("-") && externalRef.startsWith("ZP-")) {
      query = query.eq("order_number", externalRef)
    } else {
      query = query.eq("id", externalRef)
    }

    const { data: order } = await query.single()
    if (!order) return NextResponse.json({ ok: true })

    // Evitar procesar dos veces
    if (order.payment_status === "paid") return NextResponse.json({ ok: true })

    // Actualizar estado
    await supabase
      .from("orders")
      .update({
        status:                 "confirmed",
        payment_status:         "paid",
        mercadopago_payment_id: String(payment.id),
      })
      .eq("id", order.id)

    // Enviar email al cliente
    try {
      await sendConfirmationEmail({ order, items: order.order_items || [] })
    } catch (emailErr) {
      console.error("Error enviando email de confirmación:", emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error en webhook MP:", err)
    // Siempre responder 200 para que MP no reintente indefinidamente
    return NextResponse.json({ ok: true })
  }
}
