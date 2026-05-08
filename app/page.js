import Link from "next/link"
import Hero from "../components/Hero"
import CategorySection from "../components/CategorySection"
import ProductGrid from "../components/ProductGrid"
import { products } from "../data/products"

const BenefitIcons = {
  truck: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  zap: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  shield: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  heart: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
}

const benefits = [
  { iconKey: "truck",  title: "Envíos rápidos",        desc: "Recibís en 24-48h en tu puerta" },
  { iconKey: "zap",    title: "Productos inteligentes", desc: "Tecnología pensada para mascotas" },
  { iconKey: "shield", title: "Compra segura",          desc: "Pago protegido y garantía total" },
  { iconKey: "heart",  title: "Para perros y gatos",    desc: "Diseñado para su bienestar diario" },
]


export default function HomePage() {
  const featured = products.slice(0, 6)

  return (
    <>
      <Hero />

      {/* Beneficios */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-grid">
            {benefits.map((b) => (
              <div key={b.title} className="benefit-item">
                <div className="benefit-icon">{BenefitIcons[b.iconKey]}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CategorySection />

      {/* Productos destacados */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Productos destacados</h2>
            <p>Lo más elegido por nuestros clientes</p>
          </div>
          <ProductGrid products={featured} />
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link href="/productos" className="btn btn-outline btn-lg">
              Ver todos los productos →
            </Link>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="why-section">
        <div className="container">
          <div className="section-header">
            <h2>¿Por qué elegir ZetaPets?</h2>
            <p>Hacemos que cuidar a tu mascota sea simple y moderno</p>
          </div>
          <div className="why-grid">
            {[
              { n: "01", title: "Comodidad total", desc: "Comprá desde tu casa y recibís todo en la puerta. Sin filas, sin estrés." },
              { n: "02", title: "Tecnología aplicada", desc: "Productos con sensores, WiFi y automatización para el cuidado diario." },
              { n: "03", title: "Bienestar animal", desc: "Cada producto está pensado para mejorar la calidad de vida de tu mascota." },
              { n: "04", title: "Practicidad diaria", desc: "Soluciones reales para problemas reales. Nada innecesario." },
            ].map((w) => (
              <div key={w.n} className="why-item">
                <div className="why-number">{w.n}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <h2>Todo lo que tu mascota necesita,<br />en un solo lugar</h2>
          <p>Descubrí productos que combinan diseño, tecnología y amor por los animales.</p>
          <Link href="/productos" className="btn btn-white btn-lg">
            Ver todos los productos →
          </Link>
        </div>
      </section>
    </>
  )
}
