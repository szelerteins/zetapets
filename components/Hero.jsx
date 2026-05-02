import Link from "next/link"

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-tag">
              🐾 Tienda inteligente para mascotas
            </div>
            <h1>
              Tu mascota merece<br />
              <span>lo mejor</span>
            </h1>
            <p>
              Alimentación, paseo, higiene y tecnología en un solo lugar.
              Productos pensados para el bienestar real de tu compañero.
            </p>
            <div className="hero-ctas">
              <Link href="/productos" className="btn btn-primary btn-lg">
                Ver productos
              </Link>
              <Link href="/categorias" className="btn btn-outline btn-lg">
                Explorar categorías
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <span className="hero-emoji">🐶</span>
              <span className="hero-card-label">ZetaPets Store</span>

              <div className="hero-float top-right">
                ✅ Envío gratis +$30.000
              </div>
              <div className="hero-float bottom-left">
                🔒 Compra 100% segura
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
