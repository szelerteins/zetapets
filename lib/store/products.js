/**
 * lib/store/products.js
 * Catálogo de productos en memoria.
 *
 * ARQUITECTURA:
 * - Actualmente los productos viven en este array en memoria.
 * - La API (/api/products) lee desde aquí.
 * - Cuando se conecte una base de datos real (ej: PostgreSQL, MongoDB, Prisma),
 *   solo hay que reemplazar las funciones de este archivo por llamadas al ORM/DB.
 *   El resto de la app (API routes, componentes) no necesita cambiar.
 *
 * MIGRACIÓN FUTURA:
 * - Instalar: npm install prisma @prisma/client
 * - Reemplazar: return products.filter(...) → return await prisma.product.findMany(...)
 */

/** @type {import('../../data/products').Product[]} */
const products = [
  {
    id: 1,
    name: "Limpiador de Pelo",
    category: "Higiene",
    price: 14990,
    description: "Elimina el pelo de tu mascota de alfombras, ropa y muebles con facilidad. Recargable y reutilizable.",
    emoji: "🧴",
    image: "/productos/limpiador-pelo.jpg",
    stock: 24,
    variants: null,
    badge: null,
  },
  {
    id: 2,
    name: "Lanzapelotas Automático",
    category: "Juguetes",
    price: 38990,
    description: "Lanzador automático de pelotas para mantener a tu perro activo mientras vos descansás. 3 distancias ajustables.",
    emoji: "🎾",
    image: null,
    stock: 8,
    variants: null,
    badge: "Popular",
  },
  {
    id: 3,
    name: "Dispenser de Comida",
    category: "Alimentación",
    price: 52990,
    description: "Dispensador inteligente de comida con temporizador. Programá hasta 4 comidas diarias desde la app.",
    emoji: "🥣",
    image: "/productos/dispenser-comida.jpg",
    stock: 15,
    variants: null,
    badge: "Nuevo",
  },
  {
    id: 4,
    name: "Botella Portátil Comida y Agua",
    category: "Paseo",
    price: 19990,
    description: "Todo en uno para salidas largas: compartimento para agua y snacks. Libre de BPA.",
    emoji: "🚰",
    image: "/productos/botella-portatil.jpg",
    stock: 31,
    variants: ["Amarilla", "Verde", "Beige"],
    badge: null,
  },
  {
    id: 5,
    name: "Rastreador GPS",
    category: "Tecnología",
    price: 69990,
    description: "Localizá a tu mascota en tiempo real desde tu celular. Resistente al agua, batería de larga duración.",
    emoji: "📡",
    image: null,
    stock: 6,
    variants: null,
    badge: "Destacado",
  },
  {
    id: 6,
    name: "Bebedero de Agua",
    category: "Alimentación",
    price: 24990,
    description: "Bebedero con filtro de carbón activo. Mantiene el agua fresca y limpia todo el día.",
    emoji: "💧",
    image: "/productos/bebedero.jpg",
    stock: 19,
    variants: ["Transparente", "Blanco"],
    badge: null,
  },
  {
    id: 7,
    name: "Filtro para Bebedero",
    category: "Repuestos",
    price: 4990,
    description: "Filtro de repuesto compatible con todos los bebederos ZetaPets. Pack de 2 unidades.",
    emoji: "🔧",
    image: "/productos/filtro-bebedero.jpg",
    stock: 42,
    variants: null,
    badge: null,
  },
  {
    id: 8,
    name: "Collar con Soporte AirTag",
    category: "Paseo",
    price: 12990,
    description: "Collar resistente y cómodo con bolsillo integrado para AirTag. Reflectante para paseos nocturnos.",
    emoji: "🏷️",
    image: "/productos/collar-airtag.jpg",
    stock: 28,
    variants: ["XS", "S", "M", "L", "XL"],
    badge: null,
  },
  {
    id: 9,
    name: "AirTag",
    category: "Tecnología",
    price: 29990,
    description: "Accesorio de rastreo Apple compatible con red Buscar. Fácil de configurar y usar.",
    emoji: "📍",
    image: "/productos/airtag.jpg",
    stock: 13,
    variants: ["Blanco", "Negro"],
    badge: null,
  },
  {
    id: 10,
    name: "Llavero ZetaPets",
    category: "Accesorios",
    price: 5990,
    description: "Llavero con logo ZetaPets, ideal como regalo o accesorio para llevar con estilo.",
    emoji: "🔑",
    image: "/productos/llavero.jpg",
    stock: 55,
    variants: ["Celeste", "Verde", "Negro", "Blanco"],
    badge: null,
  },
  {
    id: 11,
    name: "Paños Absorbentes",
    category: "Higiene",
    price: 9990,
    description: "Paños superabsorbentes para baño y limpieza. Pack x10 unidades. Suaves para la piel.",
    emoji: "🧻",
    image: null,
    stock: 38,
    variants: null,
    badge: null,
  },
  {
    id: 12,
    name: "Comedero y Bebedero Automático",
    category: "Alimentación",
    price: 64990,
    description: "Combo automático con control por app. Programá comidas y agua para tu mascota desde cualquier lugar.",
    emoji: "🍽️",
    image: "/productos/comedero-v1.jpg",
    stock: 11,
    variants: ["Blanco", "Gris"],
    badge: "Nuevo",
  },
  {
    id: 13,
    name: "Comedero y Bebedero Automático V2",
    category: "Alimentación",
    price: 79990,
    description: "Versión mejorada con cámara incorporada y pantalla táctil. Monitorea a tu mascota mientras come.",
    emoji: "📹",
    image: "/productos/comedero-v2.jpg",
    stock: 7,
    variants: ["Blanco", "Amarillo"],
    badge: "Pro",
  },
  {
    id: 14,
    name: "Rascador para Gatos",
    category: "Gatos",
    price: 34990,
    description: "Rascador moderno de sisal natural con plataforma elevada. Mantiene las uñas de tu gato en forma.",
    emoji: "🐱",
    image: null,
    stock: 16,
    variants: null,
    badge: null,
  },
  {
    id: 99,
    name: "Producto de Prueba",
    category: "Accesorios",
    price: 1,
    description: "Producto temporal para testear el flujo de pago completo. No representa un artículo real.",
    emoji: "🧪",
    image: null,
    stock: 999,
    variants: null,
    badge: "TEST",
  },
]

// ─── Funciones del store ──────────────────────────────────────────────────────
// Estas funciones simulan lo que haría un ORM/DB.
// En el futuro: reemplazar el cuerpo de cada función por queries reales.

/** Obtener todos los productos, con filtros opcionales */
export function getAllProducts({ category, search } = {}) {
  let result = [...products]
  if (category && category !== "Todos") {
    result = result.filter((p) => p.category === category)
  }
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }
  return result
}

/** Obtener un producto por ID */
export function getProductById(id) {
  return products.find((p) => p.id === Number(id)) ?? null
}

/** Obtener categorías únicas */
export function getCategories() {
  return [...new Set(products.map((p) => p.category))]
}

/** Verificar si hay stock suficiente */
export function checkStock(productId, quantity) {
  const product = getProductById(productId)
  if (!product) return { ok: false, error: "Producto no encontrado" }
  if (product.stock < quantity) {
    return { ok: false, error: `Stock insuficiente. Disponible: ${product.stock}` }
  }
  return { ok: true }
}
