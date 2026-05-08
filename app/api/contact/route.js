/**
 * app/api/contact/route.js
 *
 * Recibe el formulario de contacto y envía un email a zetapets.ar@gmail.com
 * usando nodemailer + Gmail SMTP con App Password.
 *
 * VARIABLES DE ENTORNO requeridas (en .env.local y en Vercel > Settings > Env):
 *   GMAIL_USER         → zetapets.ar@gmail.com
 *   GMAIL_APP_PASSWORD → contraseña de aplicación de 16 caracteres
 *
 * Cómo obtener la App Password de Gmail:
 *   1. Ir a myaccount.google.com → Seguridad → Verificación en dos pasos (activar)
 *   2. Ir a myaccount.google.com → Seguridad → Contraseñas de aplicaciones
 *   3. Seleccionar "Correo" + "Otro (nombre personalizado)" → Generar
 *   4. Copiar la clave de 16 caracteres y pegarla en GMAIL_APP_PASSWORD
 */

import nodemailer from "nodemailer"

export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre, email, asunto, mensaje } = body

    // Validación básica
    if (!nombre || !email || !asunto || !mensaje) {
      return Response.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que las variables de entorno están configuradas
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Faltan las variables de entorno GMAIL_USER o GMAIL_APP_PASSWORD")
      return Response.json(
        { error: "El servicio de email no está configurado" },
        { status: 500 }
      )
    }

    // Configurar transporter de nodemailer con Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Armar el email
    await transporter.sendMail({
      from: `"ZetaPets Contacto" <${process.env.GMAIL_USER}>`,
      replyTo: `"${nombre}" <${email}>`,   // al responder, va al cliente
      to:      process.env.GMAIL_USER,      // zetapets.ar@gmail.com
      subject: `[ZetaPets Contacto] ${asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3cb96e, #3ab5c6); padding: 28px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 1.4rem;">🐾 Nueva consulta — ZetaPets</h1>
          </div>

          <div style="background: #f9fafb; padding: 28px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #374151; width: 120px;">Nombre</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #374151;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  <a href="mailto:${email}" style="color: #3ab5c6;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 700; color: #374151;">Asunto</td>
                <td style="padding: 10px 0; color: #111827;">${asunto}</td>
              </tr>
            </table>

            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <p style="font-weight: 700; color: #374151; margin: 0 0 12px;">Mensaje:</p>
              <p style="color: #374151; line-height: 1.7; margin: 0; white-space: pre-wrap;">${mensaje}</p>
            </div>

            <p style="margin: 24px 0 0; font-size: 0.82rem; color: #9ca3af;">
              Para responder, hace clic en "Responder" — el email irá directo a ${email}
            </p>
          </div>
        </div>
      `,
      // Versión texto plano como fallback
      text: `Nueva consulta en ZetaPets\n\nNombre: ${nombre}\nEmail: ${email}\nAsunto: ${asunto}\n\nMensaje:\n${mensaje}`,
    })

    return Response.json({ ok: true })

  } catch (err) {
    console.error("Error enviando email de contacto:", err)
    return Response.json(
      { error: "No se pudo enviar el mensaje. Intentá más tarde." },
      { status: 500 }
    )
  }
}
