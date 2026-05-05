"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

const heroProducts = [
  { src: "/productos/comedero-v2.jpg",     name: "Comedero Automático V2",    price: "$79.990" },
  { src: "/productos/dispenser-comida.jpg", name: "Dispenser Inteligente",     price: "$52.990" },
  { src: "/productos/bebedero.jpg",         name: "Bebedero con Filtro",       price: "$24.990" },
  { src: "/productos/collar-airtag.jpg",    name: "Collar con AirTag",         price: "$12.990" },
  { src: "/productos/airtag.jpg",           name: "AirTag Apple",              price: "$29.990" },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % heroProducts.length)
        setFading(false)
      }, 350)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const product = heroProducts[current]

  return (
    <section className="hero-split">
      <div className="container hero-split-inner">

        {/* ── LEFT ── */}
        <div className="hero-split-left">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            Productos importados pensados para tu compañero
          </div>

          <h1 className="hero-split-title">
            Lo mejor para tu<br />
            <span className="hero-highlight">mascota</span>,<br />
            sin pagar de <span className="hero-highlight-celeste">más</span>.
          </h1>

          <p className="hero-split-subtitle">
            Gadgets, accesorios y productos premium para perros y gatos.
            Importados directamente, con precios justos y envíos a todo el país por Correo Argentino.
          </p>

          <div className="hero-ctas">
            <Link href="/productos" className="btn btn-primary btn-lg">
              Ver productos →
            </Link>
            <Link href="/contacto" className="btn btn-outline btn-lg">
              Consultar
            </Link>
          </div>

          <div className="hero-pills">
            <span className="hero-pill">🚚 Envío gratis</span>
            <span className="hero-pill">💸 10% OFF</span>
            <span className="hero-pill">🔒 Compra protegida</span>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hero-split-right">

          {/* Product card */}
          <div className={`hero-product-card ${fading ? "hero-card-fade-out" : "hero-card-fade-in"}`}>
            <div className="hero-product-img">
              <Image
                src={product.src}
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 80vw, 400px"
                priority
              />
            </div>
            <div className="hero-product-info">
              <span className="hero-product-name">{product.name}</span>
              <span className="hero-product-price">{product.price}</span>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="hero-product-dots">
            {heroProducts.map((_, i) => (
              <span
                key={i}
                className={`hero-product-dot ${i === current ? "active" : ""}`}
                onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false) }, 350) }}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
