/**
 * POST /api/auth/login
 * Autenticación de administrador.
 *
 * SEGURIDAD - IMPORTANTE:
 * - Las credenciales aquí son SIMULADAS para desarrollo.
 * - En producción NUNCA guardar credenciales en el código fuente.
 * - Migración real: validar contra DB, generar JWT firmado con una clave secreta.
 * - Usar: npm install jsonwebtoken bcryptjs
 *   - bcryptjs para comparar hashes de contraseñas
 *   - jsonwebtoken para firmar tokens seguros
 * - O usar NextAuth.js: npm install next-auth
 *
 * Body esperado: { username: string, password: string }
 * Respuesta: { success: true } + cookie httpOnly 'zetapets-session'
 */

import { NextResponse } from "next/server"
import { loginSchema, parseSchema } from "../../../../lib/validations"

// SIMULADO: en producción, validar contra base de datos
// y usar bcrypt.compare(password, hashedPasswordFromDB)
const ADMIN_CREDENTIALS = {
  username: "zetapets",
  // NUNCA hacer esto en producción: las contraseñas siempre en DB como hash
  password: "Zetapetsmascotas452026",
}

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Body inválido. Se esperaba JSON." },
        { status: 400 }
      )
    }

    // Validar con Zod
    const { data, errors } = parseSchema(loginSchema, body)
    if (errors) {
      return NextResponse.json(
        { error: "Datos inválidos", details: errors },
        { status: 400 }
      )
    }

    // Verificar credenciales
    // FUTURO: const user = await prisma.user.findUnique({ where: { username: data.username } })
    //         const valid = await bcrypt.compare(data.password, user.passwordHash)
    const isValid =
      data.username === ADMIN_CREDENTIALS.username &&
      data.password === ADMIN_CREDENTIALS.password

    if (!isValid) {
      // Simular delay para dificultar brute-force
      await new Promise((r) => setTimeout(r, 300))
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      )
    }

    // Crear respuesta con cookie de sesión httpOnly
    // FUTURO: generar JWT firmado → const token = jwt.sign({ userId: user.id, role: 'admin' }, SECRET, { expiresIn: '24h' })
    const response = NextResponse.json({ success: true, message: "Login exitoso" })

    response.cookies.set("zetapets-session", "authenticated", {
      httpOnly: true,           // No accesible desde JS del cliente (protege de XSS)
      secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      sameSite: "lax",          // Protege de CSRF
      maxAge: 60 * 60 * 24,    // 24 horas
      path: "/",
    })

    return response
  } catch (err) {
    console.error("[POST /api/auth/login]", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
