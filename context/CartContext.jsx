"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "../lib/supabase/client"
import { getShippingCost } from "../lib/shipping-zones"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem("zetapets-cart")
    if (saved) setCart(JSON.parse(saved))
    const savedOrder = localStorage.getItem("zetapets-last-order")
    if (savedOrder) setLastOrder(JSON.parse(savedOrder))
  }, [])

  useEffect(() => {
    localStorage.setItem("zetapets-cart", JSON.stringify(cart))
  }, [cart])

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  function addToCart(product, selectedVariant = null) {
    setCart((prev) => {
      const key = selectedVariant ? `${product.id}-${selectedVariant}` : String(product.id)
      const existing = prev.find((item) => item.cartKey === key)
      if (existing) {
        return prev.map((item) =>
          item.cartKey === key ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, cartKey: key, selectedVariant, quantity: 1 }]
    })
    showToast(`${product.name} agregado al carrito`)
    setIsCartOpen(true)
  }

  function removeFromCart(cartKey) {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey))
  }

  function updateQuantity(cartKey, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function clearCart() {
    setCart([])
  }

  /**
   * Guarda la orden en Supabase Y en localStorage como fallback.
   * Devuelve { ok, orderNumber, error? }
   */
  async function placeOrder(userData, paymentMethod) {
    const supabase = createClient()
    const shipping = getShippingCost(userData.codigoPostal || "", totalPrice)
    const orderNumber = "ZP-" + Math.floor(100000 + Math.random() * 900000)

    // Intentar guardar en Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id:              user?.id ?? null,
          order_number:         orderNumber,
          status:               "pending",
          subtotal:             totalPrice,
          tax:                  0,
          total:                totalPrice + shipping,
          payment_method:       paymentMethod,
          shipping_name:        `${userData.nombre} ${userData.apellido}`,
          shipping_address:     userData.direccion,
          shipping_phone:       userData.telefono,
          shipping_postal_code: userData.codigoPostal,
          shipping_email:       userData.email,
        })
        .select()
        .single()

      if (!orderError && order) {
        const items = cart.map((item) => ({
          order_id:      order.id,
          product_name:  item.name,
          product_emoji: item.emoji ?? null,
          quantity:      item.quantity,
          unit_price:    item.price,
          total_price:   item.price * item.quantity,
          variant:       item.selectedVariant ?? null,
        }))
        await supabase.from("order_items").insert(items)
      }
    } catch (e) {
      // Si Supabase falla (ej: vars no configuradas), continúa con localStorage
      console.warn("Supabase no disponible, guardando orden solo en localStorage:", e.message)
    }

    // Siempre guardar en localStorage como fallback / confirmación inmediata
    const order = {
      orderNumber,
      date: new Date().toISOString(),
      items: cart,
      total: totalPrice + shipping,
      userData,
      paymentMethod,
      status: 0,
    }
    setLastOrder(order)
    localStorage.setItem("zetapets-last-order", JSON.stringify(order))
    clearCart()
    return { ok: true, orderNumber }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        lastOrder,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        toast,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
