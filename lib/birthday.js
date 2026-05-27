/**
 * lib/birthday.js
 * Utilidades para el descuento de cumpleaños de mascota.
 * Compartido entre cliente y servidor.
 */

/**
 * Devuelve true si el cumpleaños de la mascota cae dentro de los próximos 7 días
 * (incluyendo hoy). La ventana de descuento es de 8 días: día de envío del email
 * hasta el día del cumpleaños, ambos inclusive.
 *
 * @param {string} petBirthday - Fecha en formato "YYYY-MM-DD"
 */
export function isBirthdayWindowActive(petBirthday) {
  if (!petBirthday) return false
  const parts = petBirthday.split("-").map(Number)
  // parts[1] es el mes (1-based), parts[2] es el día
  const bMonth = parts[1] - 1 // 0-indexed
  const bDay   = parts[2]

  const now      = new Date()
  const todayY   = now.getFullYear()
  const todayM   = now.getMonth()
  const todayD   = now.getDate()
  const todayMs  = new Date(todayY, todayM, todayD).getTime()

  for (const year of [todayY, todayY + 1]) {
    const annivMs = new Date(year, bMonth, bDay).getTime()
    const diffDays = Math.round((annivMs - todayMs) / 86400000)
    if (diffDays >= 0 && diffDays <= 7) return true
  }
  return false
}

/**
 * Devuelve true si el cumpleaños cae exactamente en `daysFromNow` días.
 * Usado por el cron para saber a quién enviarle el email hoy.
 *
 * @param {string} petBirthday - Fecha en formato "YYYY-MM-DD"
 * @param {number} daysFromNow
 */
export function isBirthdayInExactlyDays(petBirthday, daysFromNow = 7) {
  if (!petBirthday) return false
  const parts = petBirthday.split("-").map(Number)
  const bMonth = parts[1] - 1
  const bDay   = parts[2]

  const now     = new Date()
  const todayY  = now.getFullYear()
  const todayM  = now.getMonth()
  const todayD  = now.getDate()
  const todayMs = new Date(todayY, todayM, todayD).getTime()

  for (const year of [todayY, todayY + 1]) {
    const annivMs  = new Date(year, bMonth, bDay).getTime()
    const diffDays = Math.round((annivMs - todayMs) / 86400000)
    if (diffDays === daysFromNow) return true
  }
  return false
}

/**
 * Formatea la fecha del cumpleaños para mostrar en la UI (sin el año).
 * @param {string} petBirthday - "YYYY-MM-DD"
 * @returns {string} e.g. "15 de marzo"
 */
export function formatBirthdayDisplay(petBirthday) {
  if (!petBirthday) return ""
  const [, month, day] = petBirthday.split("-").map(Number)
  const date = new Date(2000, month - 1, day)
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "long" })
}
