import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "../../../../../lib/supabase/admin"
import { createShipment, downloadLabel } from "../../../../../lib/andreani"

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("zetapets-session")?.value === "authenticated"
}

export async function GET(request, { params }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 })

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, total, delivery_method,
      shipping_name, shipping_address, shipping_city,
      shipping_postal_code, shipping_phone, shipping_email,
      ca_tracking_code
    `)
    .eq("id", id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
  }

  if (order.delivery_method === "pickup") {
    return NextResponse.json(
      { error: "Los pedidos de retiro en local no tienen etiqueta de envío" },
      { status: 400 }
    )
  }

  try {
    let trackingCode = order.ca_tracking_code

    if (!trackingCode) {
      // Primera vez: registrar el envío en Andreani y guardar el tracking
      const result = await createShipment(order)
      trackingCode = result.trackingCode

      await supabase
        .from("orders")
        .update({
          ca_tracking_code: trackingCode,
          ca_shipment_at:   new Date().toISOString(),
          status:           order.status === "confirmed" ? "shipped" : order.status,
        })
        .eq("id", id)
    }

    const labelBuffer = await downloadLabel(trackingCode)

    return new NextResponse(labelBuffer, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="etiqueta-${order.order_number}.pdf"`,
      },
    })
  } catch (err) {
    console.error("[Andreani label]", err.message)

    if (err.message.includes("no configurado")) {
      return NextResponse.json(
        {
          error:
            "Andreani no está configurado. Completá las variables ANDREANI_USUARIO, " +
            "ANDREANI_CONTRASENA y ANDREANI_CONTRATO en Vercel. " +
            "Para obtener credenciales, contactar a apis@andreani.com",
        },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
