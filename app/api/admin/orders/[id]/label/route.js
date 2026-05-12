import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "../../../../../lib/supabase/admin"
import { createShipment, downloadLabel } from "../../../../../lib/correo-argentino"

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

  // Traer la orden con todos los campos necesarios para la etiqueta
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
    return NextResponse.json({ error: "Los pedidos de retiro en local no tienen etiqueta de envío" }, { status: 400 })
  }

  try {
    let trackingCode = order.ca_tracking_code
    let labelBuffer

    if (trackingCode) {
      // Ya fue registrado en CA — solo descargar la etiqueta existente
      labelBuffer = await downloadLabel(trackingCode)
    } else {
      // Primera vez — registrar el envío en CA, guardar el tracking code
      const { trackingCode: newCode, labelUrl } = await createShipment(order)
      trackingCode = newCode

      // Persistir el tracking en la base de datos
      await supabase
        .from("orders")
        .update({
          ca_tracking_code: trackingCode,
          ca_shipment_at: new Date().toISOString(),
          status: order.status === "confirmed" ? "shipped" : order.status,
        })
        .eq("id", id)

      if (labelUrl) {
        // Algunos planes de CA incluyen la URL directa de la etiqueta
        const pdfRes = await fetch(labelUrl)
        labelBuffer = await pdfRes.arrayBuffer()
      } else {
        labelBuffer = await downloadLabel(trackingCode)
      }
    }

    return new NextResponse(labelBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="etiqueta-CA-${order.order_number}.pdf"`,
      },
    })
  } catch (err) {
    console.error("[CA label]", err.message)

    // Correo Argentino no configurado → mensaje claro para el admin
    if (err.message.includes("no configurado")) {
      return NextResponse.json(
        { error: "Correo Argentino no está configurado aún. Completá las variables CA_USUARIO, CA_CLAVE y CA_NUMERO_CLIENTE en el panel de Vercel." },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
