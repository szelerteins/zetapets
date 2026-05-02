import ProductCard from "./ProductCard"

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-light)" }}>
        <p style={{ fontSize: "2rem" }}>🔍</p>
        <p style={{ marginTop: "12px", fontWeight: 600 }}>No hay productos en esta categoría</p>
      </div>
    )
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
