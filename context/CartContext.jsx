"use client"

import { createContext, useContext, useState, useEffect } from "react"

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

  function placeOrder(userData, paymentMethod) {
    const orderNumber = "ZP-" + Math.floor(100000 + Math.random() * 900000)
    const order = {
      orderNumber,
      date: new Date().toISOString(),
      items: cart,
      total: totalPrice + (totalPrice >= 30000 ? 0 : 2990),
      userData,
      paymentMethod,
      status: 0,
    }
    setLastOrder(order)
    localStorage.setItem("zetapets-last-order", JSON.stringify(order))
    clearCart()
    return orderNumber
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
