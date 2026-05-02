"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useCart } from "../context/CartContext"
import CartDrawer from "./CartDrawer"

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/carrito", label: "Carrito" },
  { href: "/contacto", label: "Contacto" },
]

export default function Header() {
  const pathname = usePathname()
  const { totalItems, isCartOpen, setIsCartOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="logo">
              <span className="logo-paw">🐾</span>
              Zeta<span>Pets</span>
            </Link>

            <nav className="nav">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={pathname === link.href ? "active" : ""}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <button
                className="cart-btn"
                onClick={() => setIsCartOpen(true)}
                aria-label="Abrir carrito"
              >
                🛒
                {totalItems > 0 && (
                  <span className="cart-count">{totalItems}</span>
                )}
              </button>
              <Link href="/productos" className="btn btn-primary btn-sm">
                Comprar
              </Link>
              <button
                className="menu-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menú"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        <nav className={`mobile-nav ${menuOpen ? "open" : ""}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {isCartOpen && <CartDrawer />}
    </>
  )
}
