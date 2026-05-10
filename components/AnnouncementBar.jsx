"use client"

import { useState, useEffect } from "react"
import { MdLocalShipping, MdOutlineLocalOffer, MdOutlineInventory2 } from "react-icons/md"

const messages = [
  { icon: MdLocalShipping, text: "Envíos gratis a todo el país en compras desde $60.000" },
  { icon: MdOutlineLocalOffer, text: "10% OFF pagando por transferencia bancaria" },
  { icon: MdOutlineInventory2, text: "Envíos por Correo Argentino a todo el país" },
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

  const { icon: Icon, text } = messages[current]

  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        <span
          key={current}
          className={`announcement-msg ${animating ? "slide-out" : "slide-in"}`}
        >
          <Icon size={15} style={{ marginRight: 6, verticalAlign: "middle", flexShrink: 0 }} />
          {text}
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
