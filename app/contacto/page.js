"use client"

import { useState } from "react"
import { MdOutlineEmail, MdOutlinePhone, MdOutlineAccessTime, MdOutlineLocationOn, MdOutlineCheckCircle } from "react-icons/md"

export default function ContactoPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" })

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Hubo un error al enviar el mensaje.")
      } else {
        setSent(true)
      }
    } catch {
      setError("No se pudo conectar. Revisá tu conexión e intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Contacto</h1>
        <p>¿Tenés alguna pregunta? Escribinos</p>
      </div>

      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              alignItems: "start",
              maxWidth: "960px",
              margin: "0 auto",
            }}
          >
            {/* Info */}
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "20px" }}>
                Estamos para ayudarte
              </h2>
              <p style={{ color: "var(--text-light)", marginBottom: "32px", lineHeight: 1.7 }}>
                Si tenés dudas sobre un producto, un pedido o simplemente querés saber más sobre
                ZetaPets, no dudes en escribirnos.
              </p>

              {[
                { icon: <MdOutlineEmail size={22} />, label: "Email", value: "zetapets.ar@gmail.com" },
                { icon: <MdOutlinePhone size={22} />, label: "WhatsApp", value: "+5491131451107" },
                { icon: <MdOutlineAccessTime size={22} />, label: "Horario", value: "Lunes a viernes, 9 a 18 hs" },
                { icon: <MdOutlineLocationOn size={22} />, label: "Ubicación", value: "Buenos Aires, Argentina" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    gap: "14px",
                    marginBottom: "18px",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ color: "var(--celeste-dark)", marginTop: "2px", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.label}</p>
                    <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>{item.value}</p>
                  </div>
                </div>
              ))}

              {/* WhatsApp button */}
              <a
                href={`https://wa.me/5491131451107?text=${encodeURIComponent("Hola, ¿cómo estás? Quisiera hacer una consulta sobre...")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#25D366",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  padding: "12px 20px",
                  borderRadius: "var(--radius)",
                  textDecoration: "none",
                  marginTop: "8px",
                  marginBottom: "28px",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Escribinos por WhatsApp
              </a>

              {/* Redes sociales */}
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "12px" }}>Seguinos en redes</p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <a
                    href="https://instagram.com/zetapets.ar"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      padding: "10px 16px",
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    Instagram
                  </a>
                  <a
                    href="https://tiktok.com/@zetapets2"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#010101",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      padding: "10px 16px",
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/>
                    </svg>
                    TikTok
                  </a>
                </div>
              </div>
            </div>

            {/* Formulario */}
            {sent ? (
              <div
                style={{
                  background: "var(--verde-light)",
                  border: "1px solid var(--verde)",
                  borderRadius: "var(--radius)",
                  padding: "48px",
                  textAlign: "center",
                }}
              >
                <MdOutlineCheckCircle size={64} style={{ color: "var(--verde-dark)", margin: "0 auto 16px" }} />
                <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>¡Mensaje enviado!</h3>
                <p style={{ color: "var(--text-light)" }}>
                  Gracias {form.nombre}, te respondemos a la brevedad.
                </p>
                <button
                  className="btn btn-green"
                  style={{ marginTop: "20px" }}
                  onClick={() => { setSent(false); setForm({ nombre: "", email: "", asunto: "", mensaje: "" }) }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    value={form.nombre}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="asunto">Asunto</label>
                  <select
                    id="asunto"
                    name="asunto"
                    required
                    value={form.asunto}
                    onChange={handleChange}
                  >
                    <option value="">Seleccioná un asunto</option>
                    <option>Consulta sobre un producto</option>
                    <option>Estado de mi pedido</option>
                    <option>Devoluciones y garantías</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    placeholder="Escribí tu consulta acá..."
                    required
                    value={form.mensaje}
                    onChange={handleChange}
                  />
                </div>
                {error && (
                  <p style={{ color: "#ef4444", fontSize: "0.88rem", marginBottom: "8px", fontWeight: 500 }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar mensaje →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
