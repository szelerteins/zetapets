import { NextResponse } from "next/server"
import { getActiveProducts } from "../../../lib/supabase/services"

const WA_NUMBER = "5491131451107"

const SYSTEM_PROMPT = `Sos el asistente de ZetaPets, una tienda argentina de productos inteligentes para mascotas (perros y gatos).

INSTRUCCIÓN CRÍTICA: Solo podés mencionar productos que estén en el CATÁLOGO que se te provee abajo. NUNCA inventes ni menciones un producto que no esté en esa lista exacta.

Cuando menciones un producto, SIEMPRE escribí el nombre usando este formato de link:
[Nombre del producto](/productos/ID)
Donde ID es el número que aparece entre paréntesis en el catálogo.

Podés ayudar de dos formas:

1. RECOMENDAR: si el cliente no sabe qué comprar, hacé máximo 2 preguntas.
   - Primera pregunta siempre: "¿Tu mascota es perro o gato?"
   - Segunda: si es perro → tamaño del perro; si es gato → si vive adentro o afuera.
   - Después recomendá 1 o 2 productos del catálogo con nombre (como link), precio y por qué es ideal.

2. RESPONDER PREGUNTAS sobre un producto específico: usá la descripción y variantes del catálogo. Si la info no está, decí: "Para esa consulta específica te recomiendo escribirnos por WhatsApp: https://wa.me/${WA_NUMBER} — ¡te respondemos al toque!"

Reglas:
- Respondé en español rioplatense, tono amigable y directo.
- Si no sabés algo con certeza, mandalo al WhatsApp: https://wa.me/${WA_NUMBER}
- Si preguntan algo fuera de mascotas o productos, redirigí amablemente.`

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)

    if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "El body debe incluir messages" }, { status: 400 })
    }

    const { messages } = body

    const products = await getActiveProducts()

    const productList = products
      .filter((p) => (p.stock ?? 0) > 0)
      .map((p) => {
        let entry = `• ${p.name} (ID: ${p.id}) — $${Number(p.price).toLocaleString("es-AR")} — Categoría: ${p.category}`
        if (p.description) entry += `\n  Descripción: ${p.description}`
        if (p.variants?.length) entry += `\n  Talles/variantes: ${p.variants.join(", ")}`
        if (p.badge) entry += `\n  Badge: ${p.badge}`
        return entry
      })
      .join("\n\n")

    const systemWithProducts = `${SYSTEM_PROMPT}\n\n---\nCATÁLOGO (usá SOLO estos productos, respetá el ID para los links):\n${productList}`

    const groqMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }))

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemWithProducts },
          ...groqMessages,
        ],
        temperature: 0.5,
        max_tokens: 600,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error("[POST /api/chat] Groq error:", err)
      return NextResponse.json({ error: "Error al contactar Groq" }, { status: 502 })
    }

    const data = await groqRes.json()
    const reply = data?.choices?.[0]?.message?.content

    if (!reply) {
      return NextResponse.json({ error: "Respuesta vacía de Groq" }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch (err) {
    console.error("[POST /api/chat]", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
