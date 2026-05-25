'use client'

import { useState, useEffect, useRef } from "react"

const WELCOME = "¡Hola! Soy el asistente de ZetaPets. ¿Te ayudo a encontrar el producto ideal para tu mascota?"

export default function ChatBot() {
  const [isOpen, setIsOpen]     = useState(false)
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME }])
  const [input, setInput]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [products, setProducts] = useState([])
  const bottomRef = useRef(null)

  // Cargar productos al montar
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : { data: [] })
      .then((d) => setProducts(Array.isArray(d.data) ? d.data : []))
      .catch(() => {})
  }, [])

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function enviarMensaje() {
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          products: products.map((p) => ({
            name: p.name,
            price: p.price,
            category: p.category,
            description: p.description ?? "",
            variants: p.variants ?? [],
            badge: p.badge ?? "",
          })),
        }),
      })
      const data = await res.json()
      const reply = data.reply || "Ups, algo salió mal. Intentá de nuevo."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ups, algo salió mal. Intentá de nuevo." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    enviarMensaje()
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <>
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>🐾 Asistente ZetaPets</span>
            <button onClick={() => setIsOpen(false)} className="chat-close" aria-label="Cerrar chat">
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.role === "user" ? "chat-bubble--user" : "chat-bubble--bot"}`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble--bot chat-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input-row" onSubmit={onSubmit}>
            <input
              className="chat-input"
              type="text"
              placeholder="Escribí tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
              autoFocus
            />
            <button
              type="button"
              className="chat-send"
              onClick={enviarMensaje}
              disabled={!input.trim() || loading}
              aria-label="Enviar"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        className="chat-float"
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente de ZetaPets"}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          </svg>
        )}
        <span className="chat-float-tooltip">Hablar con el asistente</span>
      </button>
    </>
  )
}
