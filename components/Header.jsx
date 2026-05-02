"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import CartDrawer from "./CartDrawer"

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/carrito", label: "Carrito" },
  { href: "/contacto", label: "Contacto" },
]

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="ZetaPets - Inicio">
      <Image
        src="/logo.png"
        alt="ZetaPets"
        width={140}
        height={44}
        style={{ objectFit: "contain" }}
        priority
      />
    </Link>
  )
}

export default function Header() {
  const pathname = usePathname()
  const { totalItems, isCartOpen, setIsCartOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="container">
          <div className="header-inner">
            <Logo />

            <nav className="nav" role="navigation" aria-label="Navegación principal">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <button
                className="cart-btn"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Abrir carrito (${totalItems} productos)`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {totalItems > 0 && (
                  <span className="cart-count">{totalItems > 9 ? "9+" : totalItems}</span>
                )}
              </button>
              <Link href="/productos" className="btn btn-primary btn-sm header-cta">
                Comprar ahora
              </Link>
              <button
                className={`menu-btn ${menuOpen ? "menu-open" : ""}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        <nav
          className={`mobile-nav ${menuOpen ? "open" : ""}`}
          aria-label="Menú móvil"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/productos"
            className="btn btn-primary"
            style={{ marginTop: "8px", justifyContent: "center" }}
            onClick={() => setMenuOpen(false)}
          >
            Comprar ahora
          </Link>
        </nav>
      </header>

      {isCartOpen && <CartDrawer />}
    </>
  )
}
