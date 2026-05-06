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
import { getAllProducts, getCategories } from "../../lib/store/products"

export const metadata = {
  title: "Productos - ZetaPets",
  description: "Todos los productos para tu mascota",
}

/**
 * Server Component: lee los productos directamente del store en memoria.
 * Los Server Components pueden importar el store directamente sin HTTP.
 * La API (/api/products) existe para clientes externos o fetch del lado cliente.
 * MIGRACIÓN FUTURA: reemplazar getAllProducts() por query a la DB.
 */
export default async function ProductosPage() {
  const products = getAllProducts()
  const categories = getCategories()
  return <ProductosClient products={products} categories={categories} />
}
