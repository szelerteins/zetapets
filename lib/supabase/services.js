/**
 * lib/supabase/services.js
 * Funciones reutilizables (helpers) para interactuar con Supabase.
 * Usan el cliente de SERVIDOR para operaciones seguras.
 *
 * Uso en Client Components: importar createClient de lib/supabase/client.js
 * y llamar directamente a supabase.from(...).
 */

import { createClient } from "./server"

// ─── USUARIO ──────────────────────────────────────────────────────────────────

/** Devuelve el usuario autenticado actual (server-side) */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return null
  return user
}

/** Devuelve el perfil del usuario autenticado */
export async function getCurrentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) return null
  return data
}

/** Verifica si el usuario actual es administrador */
export async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .single()

  return !!data
}

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────

/** Devuelve todos los productos activos */
export async function getActiveProducts({ category, search } = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (category) query = query.eq("category", category)
  if (search) query = query.ilike("name", `%${search}%`)

  const { data, error } = await query
  if (error) return []
  return data
}

/** Devuelve un producto por ID */
export async function getProductById(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) return null
  return data
}

/** Verifica si hay stock suficiente */
export async function checkStock(productId, quantity) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single()

  return data ? data.stock >= quantity : false
}

// ─── ÓRDENES ─────────────────────────────────────────────────────────────────

/**
 * Crea una orden completa con sus items.
 * @param {{ userData, cart, totalPrice, shipping, paymentMethod }} params
 * @returns {{ ok: boolean, orderNumber?: string, error?: string }}
 */
export async function createOrder({ userData, cart, totalPrice, shipping, paymentMethod }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const subtotal = totalPrice
  const tax = 0
  const total = subtotal + shipping
  const orderNumber = "ZP-" + Math.floor(100000 + Math.random() * 900000)

  // 1. Crear la orden
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id:              user?.id ?? null,
      order_number:         orderNumber,
      status:               "pending",
      subtotal,
      tax,
      total,
      payment_method:       paymentMethod,
      shipping_name:        `${userData.nombre} ${userData.apellido}`,
      shipping_address:     userData.direccion,
      shipping_phone:       userData.telefono,
      shipping_postal_code: userData.codigoPostal,
      shipping_email:       userData.email,
    })
    .select()
    .single()

  if (orderError) return { ok: false, error: orderError.message }

  // 2. Insertar los items
  const items = cart.map((item) => ({
    order_id:    order.id,
    product_id:  item.id,        // puede ser null si el producto no existe en Supabase
    product_name: item.name,     // snapshot del nombre al momento de la compra
    product_emoji: item.emoji,
    quantity:    item.quantity,
    unit_price:  item.price,
    total_price: item.price * item.quantity,
    variant:     item.selectedVariant ?? null,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items)

  if (itemsError) return { ok: false, error: itemsError.message }

  // 3. Descontar stock (solo para productos que existen en Supabase)
  for (const item of cart) {
    if (!item.id) continue
    await supabase.rpc("decrement_stock", {
      p_product_id: item.id,
      p_quantity:   item.quantity,
    })
  }

  return { ok: true, orderNumber }
}

/** Devuelve el historial de órdenes del usuario actual */
export async function getUserOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return []
  return data
}

/** Calcula el total de una orden basándose en el carrito */
export function calcOrderTotal(cart, shippingCost = 0) {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return { subtotal, shipping: shippingCost, total: subtotal + shippingCost }
}
