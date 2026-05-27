/**
 * app/api/birthday-emails/route.js
 *
 * Cron job diario: envía emails de descuento de cumpleaños a los usuarios
 * cuya mascota cumple años exactamente en 7 días.
 *
 * Configurado en vercel.json como cron "0 12 * * *" (12:00 UTC = 09:00 AR)
 *
 * PROTECCIÓN: requiere el header Authorization: Bearer CRON_SECRET
 * Variable de entorno requerida: CRON_SECRET
 */

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createAdminClient } from "../../../lib/supabase/admin"
import { birthdayDiscountTemplate } from "../../../lib/email-templates"
import { isBirthdayInExactlyDays } from "../../../lib/birthday"

export async function GET(request) {
  // Validar secret para que solo Vercel Cron pueda dispararlo
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 })
  }

  // Obtener perfiles con cumpleaños de mascota y consentimiento activo
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, pet_birthday, birthday_email_consent")
    .eq("birthday_email_consent", true)
    .not("pet_birthday", "is", null)

  if (error) {
    console.error("[birthday-emails] Error al obtener perfiles:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filtrar los que cumplen en exactamente 7 días
  const todayTargets = (profiles || []).filter((p) =>
    isBirthdayInExactlyDays(p.pet_birthday, 7)
  )

  if (todayTargets.length === 0) {
    return NextResponse.json({ sent: 0, message: "Sin cumpleaños en 7 días" })
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("[birthday-emails] Faltan variables de entorno de email")
    return NextResponse.json({ error: "Email no configurado" }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  })

  let sent = 0
  const errors = []

  for (const profile of todayTargets) {
    try {
      // Obtener el email del usuario via Auth Admin
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.user_id)
      if (userError || !user?.email) continue

      const firstName = (profile.full_name || user.email.split("@")[0]).split(" ")[0]

      await transporter.sendMail({
        from:    `"ZetaPets" <${process.env.GMAIL_USER}>`,
        to:      user.email,
        subject: `🎂 ¡Se acerca el cumpleaños de tu mascota! Tu 10% de descuento te espera`,
        html:    birthdayDiscountTemplate({
          userName:    firstName,
          petBirthday: profile.pet_birthday,
          discountPct: 10,
        }),
      })

      sent++
    } catch (err) {
      console.error("[birthday-emails] Error enviando a", profile.user_id, err.message)
      errors.push(profile.user_id)
    }
  }

  console.log(`[birthday-emails] Enviados: ${sent}, Errores: ${errors.length}`)
  return NextResponse.json({ sent, errors: errors.length })
}
