import ProductosClient from "./ProductosClient"
import { getActiveProducts } from "../../lib/supabase/services"

export const metadata = {
  title: "Productos - ZetaPets",
  description: "Todos los productos para tu mascota",
}

export default async function ProductosPage({ searchParams }) {
  const params = await searchParams
  const category = params?.category
  const search = params?.search

  const products = await getActiveProducts({ category, search })
  const categories = [...new Set(products.map(p => p.category))].sort()

  return <ProductosClient products={products} categories={categories} />
}
