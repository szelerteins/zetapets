"use client"

import { useState, useEffect } from "react"
import { MdOutlinePause, MdOutlinePlayArrow, MdOutlineAdd, MdOutlineEdit, MdOutlineDelete, MdOutlineClose } from "react-icons/md"

const CATEGORIES = ["Higiene", "Juguetes", "Alimentación", "Paseo", "Tecnología", "Repuestos", "Accesorios", "Gatos"]
const BADGES = ["", "Nuevo", "Popular", "Destacado", "Pro", "Oferta"]

function formatPrice(n) {
  return "$" + Math.round(n).toLocaleString("es-AR")
}

const emptyForm = {
  name: "", description: "", price: "", stock: "", category: CATEGORIES[0],
  emoji: "", badge: "", image_url: "",
  variantsRaw: "",
  colorsRaw: "",
  is_active: true,
}

export default function ProductsTable() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  function loadProducts() {
    setLoading(true)
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  async function toggleActive(id, currentValue) {
    setToggling(id)
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !currentValue }),
    })
    loadProducts()
    setToggling(null)
  }

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setFormError("")
    setShowForm(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({
      name: p.name ?? "",
      description: p.description ?? "",
      price: p.price ?? "",
      stock: p.stock ?? "",
      category: p.category ?? CATEGORIES[0],
      emoji: p.emoji ?? "",
      badge: p.badge ?? "",
      image_url: p.image_url ?? "",
      variantsRaw: (p.variants ?? []).join(", "),
      colorsRaw: (p.color_variants ?? []).map(cv => `${cv.color}:${cv.hex}`).join(", "),
      is_active: p.is_active !== false,
    })
    setFormError("")
    setShowForm(true)
  }

  async function handleDelete(id, name) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" })
    loadProducts()
  }

  function parseVariants(raw) {
    if (!raw?.trim()) return []
    return raw.split(",").map(s => s.trim()).filter(Boolean)
  }

  function parseColors(raw) {
    if (!raw?.trim()) return []
    return raw.split(",").map(s => {
      const [color, hex] = s.split(":").map(x => x.trim())
      return { color: color || "", hex: hex || "#cccccc", image_url: "" }
    }).filter(cv => cv.color)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError("")
    if (!form.name.trim() || !form.price || !form.category) {
      setFormError("Nombre, precio y categoría son obligatorios.")
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      stock: parseInt(form.stock || "0"),
      category: form.category,
      emoji: form.emoji.trim() || null,
      badge: form.badge || null,
      image_url: form.image_url.trim() || null,
      variants: parseVariants(form.variantsRaw),
      color_variants: parseColors(form.colorsRaw),
      is_active: form.is_active,
    }

    const method = editing ? "PUT" : "POST"
    if (editing) payload.id = editing.id

    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setFormError(data.error || "Error al guardar")
      return
    }
    setShowForm(false)
    loadProducts()
  }

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <div>
          <h3>Gestión de productos</h3>
          <span className="admin-table-count">{products.length} productos</span>
        </div>
        <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }} onClick={openNew}>
          <MdOutlineAdd size={16} /> Nuevo producto
        </button>
      </div>

      {/* ── Modal de formulario ───────────────────────────────── */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: 560,
            maxHeight: "90vh", overflowY: "auto", position: "relative",
          }}>
            <button onClick={() => setShowForm(false)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer" }}>
              <MdOutlineClose size={22} />
            </button>
            <h3 style={{ marginBottom: 20 }}>{editing ? "Editar producto" : "Nuevo producto"}</h3>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={labelStyle}>
                Nombre *
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Collar ajustable" />
              </label>
              <label style={labelStyle}>
                Descripción
                <textarea style={{ ...inputStyle, height: 72, resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción del producto..." />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={labelStyle}>
                  Precio (ARS) *
                  <input style={inputStyle} type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="14990" />
                </label>
                <label style={labelStyle}>
                  Stock
                  <input style={inputStyle} type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={labelStyle}>
                  Categoría *
                  <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label style={labelStyle}>
                  Badge
                  <select style={inputStyle} value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}>
                    {BADGES.map(b => <option key={b} value={b}>{b || "— Sin badge —"}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={labelStyle}>
                  Emoji
                  <input style={inputStyle} value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🐾" maxLength={4} />
                </label>
                <label style={labelStyle}>
                  URL de imagen
                  <input style={inputStyle} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
                </label>
              </div>

              <label style={labelStyle}>
                Talles / variantes <span style={{ fontWeight: 400, color: "#888" }}>(separados por coma)</span>
                <input style={inputStyle} value={form.variantsRaw} onChange={e => setForm(f => ({ ...f, variantsRaw: e.target.value }))} placeholder="XS, S, M, L, XL" />
              </label>

              <label style={labelStyle}>
                Colores <span style={{ fontWeight: 400, color: "#888" }}>(Nombre:#HEX, separados por coma)</span>
                <input style={inputStyle} value={form.colorsRaw} onChange={e => setForm(f => ({ ...f, colorsRaw: e.target.value }))} placeholder="Rojo:#FF0000, Azul:#0055FF" />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                Publicación activa
              </label>

              {formError && <p style={{ color: "#e74c3c", fontSize: "0.85rem", margin: 0 }}>{formError}</p>}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Cargando productos...</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={!p.is_active ? "row-paused" : ""}>
                  <td>
                    <div className="product-cell">
                      {p.images?.[0] || p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images?.[0] || p.image_url} alt={p.name} className="product-thumb-sm" />
                      ) : (
                        <span className="product-emoji-sm">{p.emoji || "📦"}</span>
                      )}
                      <div>
                        <strong>{p.name}</strong>
                        {p.badge && <span className="product-badge-sm">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td><strong>{formatPrice(p.price)}</strong></td>
                  <td>
                    <span className={`stock-badge ${(p.stock || 0) <= 10 ? "stock-low" : "stock-ok"}`}>
                      {p.stock ?? 0} u.
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${p.is_active ? "badge-green" : "badge-yellow"}`}>
                      {p.is_active ? "Activo" : "Pausado"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" title="Editar" onClick={() => openEdit(p)}>
                        <MdOutlineEdit size={16} />
                      </button>
                      <button
                        className="action-btn pause"
                        title={p.is_active ? "Pausar" : "Activar"}
                        disabled={toggling === p.id}
                        onClick={() => toggleActive(p.id, p.is_active)}
                      >
                        {p.is_active ? <MdOutlinePause size={16} /> : <MdOutlinePlayArrow size={16} />}
                      </button>
                      <button className="action-btn" title="Eliminar" style={{ color: "#e74c3c" }} onClick={() => handleDelete(p.id, p.name)}>
                        <MdOutlineDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: "flex", flexDirection: "column", gap: 4, fontWeight: 600, fontSize: "0.85rem" }
const inputStyle = { padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: "0.9rem", width: "100%", boxSizing: "border-box" }
