"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import CartDrawer from "./CartDrawer"
import LogoAnimated from "./LogoAnimated"
import { MdOutlineAdminPanelSettings, MdOutlineAccountCircle, MdOutlineInventory2, MdOutlineLogout } from "react-icons/md"

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/contacto", label: "Contacto" },
]

function UserMenu({ user, isAdmin, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button
        className="user-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mi cuenta"
      >
        <span className="user-menu-avatar">
          {user.nombre.charAt(0).toUpperCase()}
        </span>
        <span className="user-menu-name">Hola, {user.nombre}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-info">
            <strong>{user.nombre} {user.apellido}</strong>
            <span>{user.email}</span>
          </div>
          <hr className="user-dropdown-divider" />
          {isAdmin && (
            <Link href="/admin/dashboard" className="user-dropdown-item user-dropdown-admin" onClick={() => setOpen(false)}>
              <MdOutlineAdminPanelSettings size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
              Panel de administrador
            </Link>
          )}
          {isAdmin && <hr className="user-dropdown-divider" />}
          <Link href="/account" className="user-dropdown-item" onClick={() => setOpen(false)}>
            <MdOutlineAccountCircle size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Mi cuenta
          </Link>
          <Link href="/orders" className="user-dropdown-item" onClick={() => setOpen(false)}>
            <MdOutlineInventory2 size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Mis pedidos
          </Link>
          <button
            className="user-dropdown-item user-dropdown-logout"
            onClick={() => { setOpen(false); onLogout() }}
          >
            <MdOutlineLogout size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems, isCartOpen, setIsCartOpen } = useCart()
  const { user, isAdmin, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function handleLogout() {
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="container">
          <div className="header-inner">
            <LogoAnimated />

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
              {/* Carrito */}
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

              {/* Auth: desktop */}
              {!loading && (
                <div className="header-auth">
                  {user ? (
                    <UserMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} />
                  ) : (
                    <>
                      <Link href="/login" className="btn btn-outline btn-sm">
                        Iniciar sesión
                      </Link>
                      <Link href="/register" className="btn btn-primary btn-sm">
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Hamburguesa mobile */}
              <button
                className={`menu-btn ${menuOpen ? "menu-open" : ""}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className={`mobile-nav ${menuOpen ? "open" : ""}`} aria-label="Menú móvil">
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

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.15)", margin: "8px 0" }} />

          {user ? (
            <>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", padding: "4px 0" }}>
                Hola, {user.nombre}
              </span>
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24", fontWeight: 700, fontSize: "0.95rem", padding: "4px 0", textDecoration: "none" }}
                >
                  <MdOutlineAdminPanelSettings size={16} />
                  Panel de administrador
                </Link>
              )}
              <button
                onClick={() => { setMenuOpen(false); handleLogout() }}
                style={{ textAlign: "left", color: "#ef4444", fontWeight: 600, fontSize: "0.95rem", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "inherit" }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-white"
                style={{ justifyContent: "center" }}
                onClick={() => setMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ marginTop: "8px", justifyContent: "center" }}
                onClick={() => setMenuOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </header>

      {isCartOpen && <CartDrawer />}
    </>
  )
}
