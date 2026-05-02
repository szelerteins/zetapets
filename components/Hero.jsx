import Link from "next/link"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">

          {/* Lado izquierdo: texto */}
          <div className="hero-content">
            <div className="hero-tag">
              <span className="hero-tag-dot" />
              Tienda inteligente para mascotas
            </div>

            <h1>
              Tu mascota<br />
              merece <span className="hero-highlight">lo mejor</span>
            </h1>

            <p>
              Alimentación, paseo, higiene y tecnología en un solo lugar.
              Productos pensados para el bienestar real de tu compañero.
            </p>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>+1.200</strong>
                <span>clientes felices</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong>14</strong>
                <span>productos únicos</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong>24h</strong>
                <span>envío express</span>
              </div>
            </div>

            <div className="hero-ctas">
              <Link href="/productos" className="btn btn-primary btn-lg">
                Ver productos
              </Link>
              <Link href="/categorias" className="btn btn-outline btn-lg">
                Explorar categorías
              </Link>
            </div>
          </div>

          {/* Lado derecho: imagen hero */}
          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <div className="hero-dog-container">
                <div className="hero-dog-bg" />

                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", zIndex: 1 }}>
                  <Image
                    src="/hero.jpg"
                    alt="Mascota feliz con ZetaPets"
                    fill
                    priority
                    style={{ objectFit: "cover" }}
                    sizes="440px"
                  />
                </div>

                <div className="hero-badge hero-badge-top">
                  <span className="badge-icon">⭐</span>
                  <div>
                    <p className="badge-title">4.9 / 5.0</p>
                    <p className="badge-sub">Calificación promedio</p>
                  </div>
                </div>

                <div className="hero-badge hero-badge-bottom">
                  <span className="badge-icon">🚀</span>
                  <div>
                    <p className="badge-title">Envío gratis</p>
                    <p className="badge-sub">En compras +$30.000</p>
                  </div>
                </div>

                <div className="hero-badge hero-badge-left">
                  <span className="badge-icon">🔒</span>
                  <div>
                    <p className="badge-title">Compra segura</p>
                    <p className="badge-sub">100% garantizado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="hero-wave">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L48 50C96 40 192 20 288 16.7C384 13 480 27 576 33.3C672 40 768 40 864 35C960 30 1056 20 1152 18.3C1248 17 1344 23 1392 26.7L1440 30V60H0Z" fill="#F5FBFA"/>
        </svg>
      </div>
    </section>
  )
}
