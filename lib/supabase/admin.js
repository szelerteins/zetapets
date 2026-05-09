/**
 * lib/supabase/admin.js
 * Cliente Supabase con service_role key — SOLO USAR EN SERVER.
 * Bypasea RLS y puede leer/escribir todo.
 */
import { createClient } from "@supabase/supabase-js"

let adminClient = null

export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  if (adminClient) return adminClient
  adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  return adminClient
}
