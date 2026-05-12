"use client"

import { useCart } from "../context/CartContext"
import { MdOutlineDeleteOutline } from "react-icons/md"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <div className="cart-item">
      <div className="cart-item-img">{item.emoji}</div>

      <div className="cart-item-info">
        <p className="cart-item-name">{item.name}</p>
        {item.selectedVariant && (
          <p className="cart-item-variant">Variante: {item.selectedVariant}</p>
        )}
        <p className="cart-item-price">{formatPrice(item.price * item.quantity)}</p>
      </div>

      <div className="cart-item-controls">
        <button
          className="qty-btn"
          onClick={() => updateQuantity(item.cartKey, -1)}
          aria-label="Disminuir"
        >
          −
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => updateQuantity(item.cartKey, 1)}
          aria-label="Aumentar"
        >
          +
        </button>
        <button
          className="remove-btn"
          onClick={() => removeFromCart(item.cartKey)}
          aria-label="Eliminar"
        >
          <MdOutlineDeleteOutline size={20} />
        </button>
      </div>
    </div>
  )
}
