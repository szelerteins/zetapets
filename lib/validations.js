/**
 * lib/validations.js
 * Esquemas de validación con Zod para todos los formularios y requests de la app.
 *
 * NOTA: Zod valida la forma de los datos antes de procesarlos.
 * En producción, estas validaciones también deben aplicarse en el backend real.
 */

import { z } from "zod"

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es requerido")
    .max(50, "Usuario demasiado largo"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "Contraseña demasiado larga"),
})

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────

export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().min(1, "La descripción es requerida").max(500),
  price: z.number().positive("El precio debe ser mayor a 0"),
  category: z.string().min(1, "La categoría es requerida"),
  image: z.string().nullable().optional(),
  emoji: z.string().optional(),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  variants: z.array(z.string()).nullable().optional(),
  badge: z.string().nullable().optional(),
})

export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// ─── CARRITO ──────────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.number().int().positive("ID de producto inválido"),
  quantity: z.number().int().min(1, "La cantidad mínima es 1").max(99, "Máximo 99 unidades"),
  selectedVariant: z.string().nullable().optional(),
})

export const updateCartSchema = z.object({
  cartKey: z.string().min(1, "cartKey requerido"),
  delta: z.number().int().refine((v) => v === 1 || v === -1, "Delta debe ser 1 o -1"),
})

export const removeFromCartSchema = z.object({
  cartKey: z.string().min(1, "cartKey requerido"),
})

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "Nombre demasiado largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "El nombre solo puede contener letras"),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "Apellido demasiado largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "El apellido solo puede contener letras"),
  email: z
    .string()
    .email("Email inválido")
    .max(100, "Email demasiado largo"),
  telefono: z
    .string()
    .min(8, "Teléfono inválido")
    .max(20, "Teléfono demasiado largo")
    .regex(/^[\d\s\-\+\(\)]+$/, "Teléfono con formato inválido"),
  direccion: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "Dirección demasiado larga"),
  codigoPostal: z
    .string()
    .min(4, "Código postal inválido")
    .max(8, "Código postal demasiado largo")
    .regex(/^\d+$/, "El código postal solo puede contener números"),
  metodoPago: z.enum(["tarjeta", "transferencia", "mercadopago"], {
    errorMap: () => ({ message: "Método de pago inválido" }),
  }),
})

// ─── REGISTRO DE CLIENTES ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "Nombre demasiado largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "Solo puede contener letras"),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "Apellido demasiado largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "Solo puede contener letras"),
  email: z.string().email("Email inválido").max(100),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "Contraseña demasiado larga"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export const customerLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

// ─── CONTACTO ─────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(100),
  email: z.string().email("Email inválido"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000),
})

// ─── HELPER: parsear y devolver errores amigables ─────────────────────────────

/**
 * Parsea un schema zod contra datos entrantes.
 * Devuelve { data, errors } donde errors es null si está todo bien,
 * o un objeto { campo: "mensaje de error" } si hay problemas.
 */
export function parseSchema(schema, data) {
  const result = schema.safeParse(data)
  if (result.success) {
    return { data: result.data, errors: null }
  }
  const errors = {}
  for (const issue of result.error.issues) {
    const field = issue.path.join(".")
    if (!errors[field]) errors[field] = issue.message
  }
  return { data: null, errors }
}
