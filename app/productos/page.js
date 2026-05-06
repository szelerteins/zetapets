/**
 * /productos — Catálogo de productos (Server Component)
 *
 * Consume datos desde la API interna /api/products en lugar de importar
 * el array directamente. Esto simula la arquitectura real donde los datos
 * vendrían de una base de datos a través de la API.
 *
 * MIGRACIÓN FUTURA:
 * - Los datos seguirán viniendo de /api/products
 * - Solo cambiará lo que está dentro del Route Handler (lib/store → DB con Prisma)
 */

import ProductosClient from "./ProductosClient"

export const metadata = {
  title: "Productos - ZetaPets",
  description: "Todos los productos para tu mascota",
}

export default async function ProductosPage() {
  let products = []
  let categories = []

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store",
    })
    if (res.ok) {
      const json = await res.json()
      products = json.data || []
      categories = json.categories || []
    }
  } catch {
    // Fallback si la API no responde (ej: en build estático)
    const { products: local } = await import("../../data/products")
    const { categories: localCats } = await import("../../data/categories")
    products = local
    categories = localCats.map((c) => c.name)
  }

  return <ProductosClient products={products} categories={categories} />
}
