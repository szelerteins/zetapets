import Link from "next/link"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="hero-full">
      {/* Imagen de fondo */}
      <div className="hero-bg-image">
        <Image
          src="/hero.jpg"
          alt="Mascota feliz con ZetaPets"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="100vw"
          quality={90}
        />
      </div>

      {/* Overlay degradado para legibilidad */}
      <div className="hero-overlay" />

      {/* Contenido */}
      <div className="container hero-full-content">
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          Tienda inteligente para mascotas
        </div>

        <h1 className="hero-full-title">
          Tu mascota merece<br />
          <span className="hero-highlight">lo mejor</span>
        </h1>

        <p className="hero-full-subtitle">
          Alimentación, paseo, higiene y tecnología en un solo lugar.
          Productos pensados para el bienestar real de tu compañero.
        </p>

        <div className="hero-stats">
          <div className="hero-stat hero-stat-light">
            <strong>+1.200</strong>
            <span>clientes felices</span>
          </div>
          <div className="hero-stat-divider hero-stat-divider-light" />
          <div className="hero-stat hero-stat-light">
            <strong>14</strong>
            <span>productos únicos</span>
          </div>
          <div className="hero-stat-divider hero-stat-divider-light" />
          <div className="hero-stat hero-stat-light">
            <strong>24h</strong>
            <span>envío express</span>
          </div>
        </div>

        <div className="hero-ctas">
          <Link href="/productos" className="btn btn-primary btn-lg">
            Ver productos
          </Link>
          <Link href="/categorias" className="btn btn-white btn-lg">
            Explorar categorías
          </Link>
        </div>
      </div>

      {/* Ola inferior */}
      <div className="hero-wave">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L48 50C96 40 192 20 288 16.7C384 13 480 27 576 33.3C672 40 768 40 864 35C960 30 1056 20 1152 18.3C1248 17 1344 23 1392 26.7L1440 30V60H0Z" fill="#F5FBFA"/>
        </svg>
      </div>
    </section>
  )
}
