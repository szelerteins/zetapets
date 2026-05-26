import { NextResponse } from "next/server"
import { getMercadoPagoClient, Payment } from "../../../../lib/mercadopago"
import { createAdminClient } from "../../../../lib/supabase/admin"
import { orderConfirmationTemplate } from "../../../../lib/email-templates"
import { appendWebSale, decrementStockVentas } from "../../../../lib/sheets"
import nodemailer from "nodemailer"

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

    const fecha = new Date().toLocaleDateString("es-AR")
    const orderId = orderFull.order_number || orderFull.id

    for (const item of orderFull.order_items) {
      const sku = item.products?.sku || null

      await appendWebSale({
        fecha,
        orderId,
        sku,
        nombre: item.product_name,
        variante: item.variant || "",
        cantidad: item.quantity,
        precioUnitario: item.unit_price,
        total: item.total_price,
      })

      if (sku) {
        await decrementStockVentas(sku, item.quantity)
      }
    }
  } catch (err) {
    console.error("[Sheets] Error registrando venta web:", err.message)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

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

    const externalRef = payment.external_reference
    let query = supabase.from("orders").select("*, order_items(*)")

    if (externalRef && externalRef.startsWith("ZP-")) {
      query = query.eq("order_number", externalRef)
    } else {
      query = query.eq("id", externalRef)
    }

    const { data: order } = await query.single()
    if (!order) return NextResponse.json({ ok: true })

    // Evitar procesar dos veces
    if (order.payment_status === "paid") return NextResponse.json({ ok: true })

    // Actualizar estado en Supabase
    await supabase
      .from("orders")
      .update({
        status:                 "confirmed",
        payment_status:         "paid",
        mercadopago_payment_id: String(payment.id),
      })
      .eq("id", order.id)

    // Notificación WhatsApp
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

    // Registrar en Google Sheets (no bloquea la respuesta si falla)
    registerSaleInSheets(supabase, order).catch(err =>
      console.error("[Sheets] Error asíncrono:", err.message)
    )

    // Enviar email al cliente
    try {
      await sendConfirmationEmail({ order, items: order.order_items || [] })
    } catch (emailErr) {
      console.error("Error enviando email:", emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error en webhook MP:", err)
    return NextResponse.json({ ok: true })
  }
}
