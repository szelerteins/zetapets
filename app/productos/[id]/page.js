import Link from "next/link"
import { getProductById, getActiveProducts } from "../../../lib/supabase/services"
import ProductoDetalleClient from "./ProductoDetalleClient"
import { MdOutlineCategory } from "react-icons/md"

export async function generateMetadata({ params }) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: "Producto no encontrado - ZetaPets" }
  return {
    title: `${product.name} - ZetaPets`,
    description: product.description || `Comprá ${product.name} en ZetaPets`,
  }
}

export default async function ProductoPage({ params }) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px" }}>
        <MdOutlineCategory size={56} style={{ color: "var(--text-light)", marginBottom: 16 }} />
        <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Producto no encontrado</h2>
        <Link href="/productos" className="btn btn-primary">Ver todos los productos</Link>
      </div>
    )
  }

  const allProducts = await getActiveProducts({ category: product.category })
  const related = allProducts.filter(p => p.id !== product.id).slice(0, 3)

  return <ProductoDetalleClient product={product} related={related} />
}
