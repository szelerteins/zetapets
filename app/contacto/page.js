"use client"

import { useState } from "react"

export default function ContactoPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" })

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
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
                Estamos para ayudarte 🐾
              </h2>
              <p style={{ color: "var(--text-light)", marginBottom: "32px", lineHeight: 1.7 }}>
                Si tenés dudas sobre un producto, un pedido o simplemente querés saber más sobre
                ZetaPets, no dudes en escribirnos.
              </p>

              {[
                { icon: "📧", label: "Email", value: "hola@zetapets.com" },
                { icon: "📱", label: "WhatsApp", value: "+54 9 11 1234-5678" },
                { icon: "⏰", label: "Horario", value: "Lunes a viernes, 9 a 18 hs" },
                { icon: "📍", label: "Ubicación", value: "Buenos Aires, Argentina" },
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
                  <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.label}</p>
                    <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>{item.value}</p>
                  </div>
                </div>
              ))}
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
                <p style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</p>
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
                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Enviar mensaje →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
