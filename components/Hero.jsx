"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR")
}

export default function Hero() {
  const [heroProducts, setHeroProducts] = useState([])
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    fetch("/api/products?limit=50")
      .then((r) => r.json())
      .then(({ data }) => {
        const withImage = (data || [])
          .filter((p) => (p.stock ?? 0) > 0 && (p.images?.[0] || p.image_url))
          .slice(0, 6)
          .map((p) => ({
            src: p.images?.[0] || p.image_url,
            name: p.name,
            price: formatPrice(p.price),
            href: `/productos/${p.id}`,
          }))
        setHeroProducts(withImage)
      })
      .catch(() => setHeroProducts([]))
  }, [])

  useEffect(() => {
    if (heroProducts.length < 2) return
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % heroProducts.length)
        setFading(false)
      }, 350)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroProducts.length])

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
            Gadgets y accesorios premium importados para perros y gatos.
            Precios justos, envíos a todo el país.
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
            <span className="hero-pill">Envío gratis desde $60.000</span>
            <span className="hero-pill">10% OFF primera compra</span>
            <span className="hero-pill">Compra protegida</span>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hero-split-right">

          {/* Product card */}
          {product && (
            <Link
              href={product.href}
              className={`hero-product-card hero-product-card--link ${fading ? "hero-card-fade-out" : "hero-card-fade-in"}`}
            >
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
                <span className="hero-product-cta">Ver producto →</span>
              </div>
            </Link>
          )}

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
