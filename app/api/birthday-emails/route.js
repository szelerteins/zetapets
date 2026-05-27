/**
 * app/api/birthday-emails/route.js
 *
 * Cron job diario: envía emails de descuento de cumpleaños a los usuarios
 * cuya mascota cumple años exactamente en 7 días.
 * Genera un código único por usuario y lo guarda con fecha de vencimiento.
 *
 * Configurado en vercel.json como cron "0 12 * * *" (12:00 UTC = 09:00 AR)
 * Requiere variable de entorno: CRON_SECRET
 */

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createAdminClient } from "../../../lib/supabase/admin"
import { birthdayDiscountTemplate } from "../../../lib/email-templates"
import { isBirthdayInExactlyDays } from "../../../lib/birthday"

function generateCouponCode() {
  // Alfabeto sin caracteres confusos (0/O, 1/I/L)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "ZETA"
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function getExpiresAt(petBirthday) {
  const parts = petBirthday.split("-").map(Number)
  const bMonth = parts[1] - 1
  const bDay   = parts[2]
  const now    = new Date()
  const year   = now.getFullYear()

  let anniversary = new Date(year, bMonth, bDay)
  if (anniversary < now) anniversary = new Date(year + 1, bMonth, bDay)

  // Vence el día siguiente al cumpleaños a las 00:00 UTC
  return new Date(anniversary.getFullYear(), anniversary.getMonth(), anniversary.getDate() + 1)
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 })
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, pet_birthday, birthday_email_consent")
    .eq("birthday_email_consent", true)
    .not("pet_birthday", "is", null)

  if (error) {
    console.error("[birthday-emails] Error al obtener perfiles:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const todayTargets = (profiles || []).filter((p) =>
    isBirthdayInExactlyDays(p.pet_birthday, 7)
  )

  if (todayTargets.length === 0) {
    return NextResponse.json({ sent: 0, message: "Sin cumpleaños en 7 días" })
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
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
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.user_id)
      if (userError || !user?.email) continue

      // Generar código único y guardarlo con vencimiento
      const code      = generateCouponCode()
      const expiresAt = getExpiresAt(profile.pet_birthday)

      await supabase
        .from("profiles")
        .update({ discount_code: code, discount_expires_at: expiresAt.toISOString() })
        .eq("user_id", profile.user_id)

      const firstName = (profile.full_name || user.email.split("@")[0]).split(" ")[0]

      await transporter.sendMail({
        from:    `"ZetaPets" <${process.env.GMAIL_USER}>`,
        to:      user.email,
        subject: `🎂 ¡Se acerca el cumpleaños de tu mascota! Tu código de descuento`,
        html:    birthdayDiscountTemplate({
          userName:    firstName,
          petBirthday: profile.pet_birthday,
          discountPct: 10,
          couponCode:  code,
          expiresAt,
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
