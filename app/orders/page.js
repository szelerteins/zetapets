"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"
import { createClient } from "../../lib/supabase/client"
import { MdOutlineInventory2, MdOutlineLocationOn } from "react-icons/md"

const STATUS_LABEL = {
  pending:   { label: "Pendiente",   color: "#f59e0b" },
  confirmed: { label: "Confirmado",  color: "#3ab5c6" },
  shipped:   { label: "En camino",   color: "#8b5cf6" },
  delivered: { label: "Entregado",   color: "#22c55e" },
  cancelled: { label: "Cancelado",   color: "#ef4444" },
}

function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR")
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [orders, setOrders]       = useState([])
  const [fetching, setFetching]   = useState(true)
  const [expanded, setExpanded]   = useState(null)

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/orders")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    async function fetchOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error) setOrders(data ?? [])
      setFetching(false)
    }
    fetchOrders()
  }, [user, supabase])

  if (loading || fetching) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <p style={{ color: "var(--text-light)" }}>Cargando pedidos...</p>
    </div>
  )

  if (!user) return null

  return (
    <>
      <div className="page-header">
        <h1>Mis pedidos</h1>
        <p>Historial de compras y seguimiento</p>
      </div>

      <section style={{ padding: "48px 0 80px" }}>
        <div className="container" style={{ maxWidth: 780 }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid var(--border)" }}>
            {[
              { label: "Mi perfil",   href: "/account" },
              { label: "Mis pedidos", href: "/orders"  },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderBottom: tab.href === "/orders" ? "2px solid var(--verde)" : "2px solid transparent",
                  color: tab.href === "/orders" ? "var(--verde)" : "var(--text-light)",
                  textDecoration: "none",
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <MdOutlineInventory2 size={56} style={{ color: "var(--text-light)", margin: "0 auto 16px" }} />
              <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>Todavía no hiciste ninguna compra</p>
              <p style={{ color: "var(--text-light)", marginBottom: 24 }}>Explorá nuestro catálogo y encontrá lo que tu mascota necesita.</p>
              <Link href="/productos" className="btn btn-primary">Ver productos</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {orders.map((order) => {
                const st = STATUS_LABEL[order.status] ?? { label: order.status, color: "#6b7280" }
                const isOpen = expanded === order.id
                return (
                  <div key={order.id} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>

                    {/* Cabecera del pedido */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>#{order.order_number}</span>
                          <span style={{ background: st.color + "22", color: st.color, fontWeight: 700, fontSize: "0.75rem", padding: "2px 10px", borderRadius: 20 }}>
                            {st.label}
                          </span>
                        </div>
                        <p style={{ color: "var(--text-light)", fontSize: "0.84rem" }}>
                          {formatDate(order.created_at)} · {formatPrice(order.total)}
                        </p>
                      </div>
                      <span style={{ color: "var(--text-light)", fontSize: "1.1rem", transition: "transform 0.2s", display: "block", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
                    </button>

                    {/* Detalle del pedido */}
                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px" }}>
                        {/* Items */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                          {(order.order_items ?? []).map((item) => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: "1.2rem" }}>{item.product_emoji ?? <MdOutlineInventory2 size={20} />}</span>
                                <div>
                                  <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{item.product_name}</p>
                                  {item.variant && <p style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>{item.variant}</p>}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ fontSize: "0.82rem", color: "var(--text-light)" }}>x{item.quantity}</p>
                                <p style={{ fontWeight: 700, fontSize: "0.88rem" }}>{formatPrice(item.total_price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totales */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                            <span style={{ color: "var(--text-light)" }}>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                            <span style={{ color: "var(--text-light)" }}>Envío</span>
                            <span>{order.total - order.subtotal === 0 ? "Gratis" : formatPrice(order.total - order.subtotal)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "0.95rem", marginTop: 4 }}>
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>

                        {/* Datos de envío */}
                        {order.shipping_address && (
                          <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--bg)", borderRadius: 8, fontSize: "0.82rem", color: "var(--text-light)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                            <MdOutlineLocationOn size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                            {order.shipping_name} · {order.shipping_address} (CP {order.shipping_postal_code})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </section>
    </>
  )
}
