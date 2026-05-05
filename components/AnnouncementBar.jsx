"use client"

import { useState, useEffect } from "react"

const messages = [
  "🚚 Envíos gratis a todo el país en compras desde $60.000",
  "💸 10% OFF pagando por transferencia bancaria",
  "📦 Envíos por Correo Argentino a todo el país",
]

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % messages.length)
        setAnimating(false)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        <span
          key={current}
          className={`announcement-msg ${animating ? "slide-out" : "slide-in"}`}
        >
          {messages[current]}
        </span>
      </div>
      <div className="announcement-dots">
        {messages.map((_, i) => (
          <span
            key={i}
            className={`announcement-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  )
}
