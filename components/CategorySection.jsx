import Image from "next/image"
import Link from "next/link"
import { categories } from "../data/categories"

export default function CategorySection() {
  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <h2>Categorías destacadas</h2>
          <p>Encontrá todo lo que necesitás para tu compañero</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias?cat=${cat.id}`}
              className="category-card category-card-photo"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="category-card-overlay" />
              <div className="category-card-content">
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
