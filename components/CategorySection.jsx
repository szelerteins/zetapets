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
              className="category-card"
            >
              <div className="category-emoji">{cat.emoji}</div>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
