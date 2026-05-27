"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"
import { createClient } from "../../lib/supabase/client"

export default function AccountPage() {
  const { user, profile, loading, logout, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    full_name: "", phone: "", address: "", city: "", postal_code: "",
    pet_birthday: "", birthday_email_consent: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState("")

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/account")
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setForm({
        full_name:               profile.full_name               ?? "",
        phone:                   profile.phone                   ?? "",
        address:                 profile.address                 ?? "",
        city:                    profile.city                    ?? "",
        postal_code:             profile.postal_code             ?? "",
        pet_birthday:            profile.pet_birthday            ?? "",
        birthday_email_consent:  profile.birthday_email_consent  ?? false,
      })
    }
  }, [profile])

  async function handleSave(e) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError("")

    const { error: err } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...form }, { onConflict: "user_id" })

    setSaving(false)
    if (err) { setError("No se pudo guardar. Intentá de nuevo."); return }
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleLogout() {
    await logout()
    router.push("/")
    router.refresh()
  }

  if (loading) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <p style={{ color: "var(--text-light)" }}>Cargando...</p>
    </div>
  )

  if (!user) return null

  return (
    <>
      <div className="page-header">
        <h1>Mi cuenta</h1>
        <p>Administrá tu perfil y preferencias</p>
      </div>

      <section style={{ padding: "48px 0 80px" }}>
        <div className="container" style={{ maxWidth: 720 }}>

          {/* Tabs de navegación */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {[
              { label: "Mi perfil",   href: "/account" },
              { label: "Mis pedidos", href: "/orders"  },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderBottom: tab.href === "/account" ? "2px solid var(--verde)" : "2px solid transparent",
                  color: tab.href === "/account" ? "var(--verde)" : "var(--text-light)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Card de perfil */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "32px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--verde)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800, flexShrink: 0 }}>
                {(form.full_name || user.email)[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "1.05rem" }}>{form.full_name || "Sin nombre"}</p>
                <p style={{ color: "var(--text-light)", fontSize: "0.88rem" }}>{user.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <div className="form-group">
                <label>Nombre completo</label>
                <input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Juan García" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+54 9 11 XXXX-XXXX" />
                </div>
                <div className="form-group">
                  <label>Código postal</label>
                  <input value={form.postal_code} onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))} placeholder="C1043" />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Av. Corrientes 1234, CABA" />
              </div>

              <div className="form-group">
                <label>Ciudad</label>
                <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Buenos Aires" />
              </div>

              {/* Sección cumpleaños mascota */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "18px 20px" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#166534", fontSize: "0.92rem" }}>
                  🎂 Cumpleaños de tu mascota
                </p>
                <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                  Registrá la fecha y te mandamos un <strong>10% de descuento</strong> una semana antes para celebrarlo con una compra especial.
                </p>

                <div className="form-group" style={{ marginBottom: form.pet_birthday ? 12 : 0 }}>
                  <label style={{ color: "#166534" }}>Fecha de nacimiento <span style={{ fontWeight: 400, color: "#64748b" }}>(opcional)</span></label>
                  <input
                    type="date"
                    value={form.pet_birthday}
                    onChange={(e) => setForm((p) => ({ ...p, pet_birthday: e.target.value, birthday_email_consent: e.target.value ? p.birthday_email_consent : false }))}
                    max={new Date().toISOString().split("T")[0]}
                    style={{ borderColor: "#bbf7d0" }}
                  />
                </div>

                {form.pet_birthday && (
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: "0.85rem", color: "#374151" }}>
                    <input
                      type="checkbox"
                      checked={form.birthday_email_consent}
                      onChange={(e) => setForm((p) => ({ ...p, birthday_email_consent: e.target.checked }))}
                      style={{ marginTop: 2, flexShrink: 0, accentColor: "#16a34a" }}
                    />
                    <span>
                      Quiero recibir el email de descuento de cumpleaños de ZetaPets.
                      <span style={{ color: "#64748b" }}> (Podés desactivarlo en cualquier momento.)</span>
                    </span>
                  </label>
                )}
              </div>

              {error && <p style={{ color: "#ef4444", fontSize: "0.88rem" }}>{error}</p>}
              {saved && <p style={{ color: "var(--verde)", fontSize: "0.88rem", fontWeight: 600 }}>Perfil guardado correctamente</p>}

              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button type="button" onClick={handleLogout} className="btn btn-outline" style={{ color: "#ef4444", borderColor: "#ef4444" }}>
                  Cerrar sesión
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>
    </>
  )
}
