"use client"

import { useCart } from "../context/CartContext"
import { MdOutlineCheckCircle } from "react-icons/md"

export default function Toast() {
  const { toast } = useCart()

  if (!toast) return null

  return (
    <div className="toast" role="alert">
      <MdOutlineCheckCircle size={18} />
      {toast}
    </div>
  )
}
