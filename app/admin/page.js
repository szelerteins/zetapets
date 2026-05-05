/**
 * PÁGINA DE LOGIN - /admin
 *
 * SEGURIDAD (IMPORTANTE):
 * - Este login es SIMULADO para demo. Las credenciales están en el frontend.
 * - En producción: NUNCA guardes credenciales en el código del cliente.
 * - La autenticación real debe hacerse con:
 *   - Backend propio con JWT y sesiones seguras
 *   - NextAuth.js con providers (Google, Credentials, etc.)
 *   - Middleware de Next.js para proteger rutas
 */
import AdminLoginClient from "./AdminLoginClient"

export const metadata = {
  title: "Admin - ZetaPets",
}

export default function AdminPage() {
  return <AdminLoginClient />
}
