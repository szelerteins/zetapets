import Link from "next/link"
import Hero from "../components/Hero"
import CategorySection from "../components/CategorySection"
import ProductGrid from "../components/ProductGrid"
import { products } from "../data/products"

const benefits = [
  { icon: "🚀", title: "Envíos rápidos", desc: "Recibís en 24-48h en tu puerta" },
  { icon: "🧠", title: "Productos inteligentes", desc: "Tecnología pensada para mascotas" },
  { icon: "🔒", title: "Compra segura", desc: "Pago protegido y garantía total" },
  { icon: "❤️", title: "Para perros y gatos", desc: "Diseñado para su bienestar diario" },
]

const testimonials = [
  {
    text: "El comedero inteligente cambió nuestra rutina. Puedo programar las comidas de Rocky aunque llegue tarde del trabajo.",
    author: "María G.",
    pet: "Dueña de Rocky (Golden Retriever)",
    avatar: "M",
  },
  {
    text: "La cama ortopédica fue lo mejor que le compré a mi perro senior. Descansa mejor y tiene más energía.",
    author: "Carlos R.",
    pet: "Dueño de Max (Labrador, 10 años)",
    avatar: "C",
  },
  {
    text: "Pedí un collar y llegó al día siguiente. La calidad es excelente y mi gata lo usa cómoda en los paseos.",
    author: "Laura P.",
    pet: "Dueña de Misi (Gata Siamés)",
    avatar: "L",
  },
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
                <div className="benefit-icon">{b.icon}</div>
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

      {/* Testimonios */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Lo que dicen nuestros clientes</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.author} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <div>
                    <p className="author-name">{t.author}</p>
                    <p className="author-pet">{t.pet}</p>
                  </div>
                </div>
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
