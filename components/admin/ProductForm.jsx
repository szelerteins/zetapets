"use client"

import { useState, useRef } from "react"
import { MdClose, MdAdd, MdDelete, MdCloudUpload, MdCheckCircle, MdError, MdSearch } from "react-icons/md"

const CATEGORIES = ["Higiene", "Juguetes", "Alimentación", "Paseo", "Tecnología", "Accesorios", "Repuestos", "Gatos"]
const BADGES = ["", "Nuevo", "Popular", "Destacado", "Pro", "Oferta"]

function parseFeatures(arr) {
  if (!arr?.length) return []
  return arr.map(f => {
    const idx = f.indexOf(": ")
    if (idx === -1) return { label: f, value: "" }
    return { label: f.slice(0, idx), value: f.slice(idx + 2) }
  })
}

function serializeFeatures(rows) {
  return rows
    .filter(r => r.label.trim() && r.value.trim() && r.value !== "N/A")
    .map(r => `${r.label.trim()}: ${r.value.trim()}`)
}

export default function ProductForm({ mode, product, onClose, onSaved }) {
  const isEdit = mode === "edit"

  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || CATEGORIES[0],
    sku: product?.sku || "",
    stock: product?.stock || 0,
    emoji: product?.emoji || "",
    badge: product?.badge || "",
    is_active: product?.is_active !== false,
    variants: product?.variants || [],
    images: product?.images || (product?.image_url ? [product.image_url] : []),
    features: parseFeatures(product?.features),
  })

  const [skuStatus, setSkuStatus] = useState(
    isEdit && product?.sku ? { valid: true, checked: true } : null
  )
  const [newVariant, setNewVariant] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [uploadingIdx, setUploadingIdx] = useState(null)
  const fileInputRef = useRef(null)
  const activeUploadIdx = useRef(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  // ─── SKU validation ───────────────────────────────────────────────────────────

  async function checkSKU() {
    const sku = form.sku.trim()
    if (!sku) return
    setSkuStatus({ checking: true })
    try {
      const res = await fetch(`/api/admin/products/validate-sku?sku=${encodeURIComponent(sku)}`)
      const data = await res.json()
      if (data.valid) {
        setSkuStatus({ valid: true, checked: true, nombre: data.nombre, stock: data.stockActual })
        if (!isEdit) set("stock", data.stockActual)
      } else {
        setSkuStatus({ valid: false, checked: true, error: data.error })
      }
    } catch {
      setSkuStatus({ valid: false, checked: true, error: "No se pudo conectar con el Excel" })
    }
  }

  // ─── Images ───────────────────────────────────────────────────────────────────

  async function handleFileUpload(e, insertAt) {
    const file = e.target.files?.[0]
    if (!file) return
    activeUploadIdx.current = insertAt
    setUploadingIdx(insertAt)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) {
        setForm(f => {
          const imgs = [...f.images]
          if (insertAt === -1) {
            imgs.push(data.url)
          } else {
            imgs[insertAt] = data.url
          }
          return { ...f, images: imgs }
        })
      } else {
        setError(data.error || "Error al subir imagen")
      }
    } catch {
      setError("Error al subir imagen")
    } finally {
      setUploadingIdx(null)
      e.target.value = ""
    }
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  // ─── Features ─────────────────────────────────────────────────────────────────

  function addFeature() {
    setForm(f => ({ ...f, features: [...f.features, { label: "", value: "" }] }))
  }

  function updateFeature(idx, field, value) {
    setForm(f => {
      const feats = [...f.features]
      feats[idx] = { ...feats[idx], [field]: value }
      return { ...f, features: feats }
    })
  }

  function removeFeature(idx) {
    setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }))
  }

  // ─── Variants ────────────────────────────────────────────────────────────────

  function addVariant() {
    const v = newVariant.trim()
    if (!v || form.variants.includes(v)) return
    setForm(f => ({ ...f, variants: [...f.variants, v] }))
    setNewVariant("")
  }

  function removeVariant(v) {
    setForm(f => ({ ...f, variants: f.variants.filter(x => x !== v) }))
  }

  // ─── Save ─────────────────────────────────────────────────────────────────────

  async function handleSave(e) {
    e.preventDefault()
    setError("")

    if (!form.name.trim()) return setError("El nombre es requerido")
    if (!form.price || Number(form.price) <= 0) return setError("El precio debe ser mayor a 0")
    if (!form.sku.trim()) return setError("El SKU es requerido")
    if (!skuStatus?.valid) return setError("Validá el SKU antes de guardar")

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      sku: form.sku.trim(),
      stock: Number(form.stock) || 0,
      emoji: form.emoji.trim() || null,
      badge: form.badge || null,
      is_active: form.is_active,
      variants: form.variants,
      features: serializeFeatures(form.features),
      images: form.images,
      color_variants: null,
    }

    try {
      const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al guardar")
      } else {
        onSaved()
      }
    } catch {
      setError("Error de red al guardar")
    } finally {
      setSaving(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="pf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pf-modal">

        {/* Header */}
        <div className="pf-header">
          <h2 className="pf-title">{isEdit ? "Editar publicación" : "Nueva publicación"}</h2>
          <button className="pf-close" onClick={onClose}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSave} className="pf-body">

          {/* ── SECCIÓN 1: Información básica ── */}
          <div className="pf-section">
            <h3 className="pf-section-title">Información básica</h3>
            <div className="pf-row">
              <div className="pf-field pf-field--grow">
                <label>Nombre del producto *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="Ej: Collar con Soporte AirTag"
                  maxLength={120}
                />
              </div>
              <div className="pf-field pf-field--cat">
                <label>Categoría *</label>
                <select value={form.category} onChange={e => set("category", e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="pf-row">
              <div className="pf-field pf-field--price">
                <label>Precio ARS *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => set("price", e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
              <div className="pf-field pf-field--badge">
                <label>Badge</label>
                <select value={form.badge} onChange={e => set("badge", e.target.value)}>
                  <option value="">Sin badge</option>
                  {BADGES.filter(b => b).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="pf-field pf-field--emoji">
                <label>Emoji</label>
                <input
                  type="text"
                  value={form.emoji}
                  onChange={e => set("emoji", e.target.value)}
                  placeholder="🐾"
                  maxLength={4}
                />
              </div>
            </div>

            {/* SKU con validación */}
            <div className="pf-field">
              <label>SKU * <span className="pf-label-hint">(debe coincidir con el Excel)</span></label>
              <div className="pf-sku-row">
                <input
                  type="text"
                  value={form.sku}
                  onChange={e => { set("sku", e.target.value); setSkuStatus(null) }}
                  placeholder="Ej: 009-A"
                  style={{ fontFamily: "monospace" }}
                  disabled={isEdit}
                />
                {!isEdit && (
                  <button
                    type="button"
                    className="pf-btn-sku"
                    onClick={checkSKU}
                    disabled={!form.sku.trim() || skuStatus?.checking}
                  >
                    {skuStatus?.checking ? "Buscando..." : <><MdSearch size={16} /> Validar</>}
                  </button>
                )}
              </div>
              {skuStatus?.checked && (
                <div className={`pf-sku-status ${skuStatus.valid ? "valid" : "invalid"}`}>
                  {skuStatus.valid ? (
                    <>
                      <MdCheckCircle size={16} />
                      SKU válido — {skuStatus.nombre} | Stock actual en Excel: <strong>{skuStatus.stock}</strong> u.
                    </>
                  ) : (
                    <><MdError size={16} /> {skuStatus.error}</>
                  )}
                </div>
              )}
            </div>

            <div className="pf-field">
              <label>Stock inicial</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => set("stock", e.target.value)}
                min="0"
                placeholder="Se completa desde el Excel al validar el SKU"
              />
              <span className="pf-hint">Se sincroniza con el Excel en cada venta</span>
            </div>

            <div className="pf-field">
              <label>Descripción</label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Describí el producto: qué es, para qué sirve, beneficios..."
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>

          {/* ── SECCIÓN 2: Fotos ── */}
          <div className="pf-section">
            <h3 className="pf-section-title">Fotos</h3>
            <p className="pf-section-desc">La primera foto es la principal. Máximo 8 fotos. JPG, PNG, WEBP o GIF hasta 5MB.</p>

            <div className="pf-images-grid">
              {form.images.map((url, idx) => (
                <div key={idx} className="pf-img-slot pf-img-slot--filled">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${idx + 1}`} />
                  {idx === 0 && <span className="pf-img-main-badge">Principal</span>}
                  <div className="pf-img-actions">
                    <label className="pf-img-replace" title="Reemplazar">
                      <MdCloudUpload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => handleFileUpload(e, idx)}
                      />
                    </label>
                    <button type="button" className="pf-img-delete" onClick={() => removeImage(idx)} title="Eliminar">
                      <MdDelete size={16} />
                    </button>
                  </div>
                  {uploadingIdx === idx && <div className="pf-img-uploading">Subiendo...</div>}
                </div>
              ))}

              {form.images.length < 8 && (
                <label className="pf-img-slot pf-img-slot--add">
                  {uploadingIdx === -1 ? (
                    <span className="pf-img-uploading-label">Subiendo...</span>
                  ) : (
                    <>
                      <MdCloudUpload size={28} />
                      <span>Subir foto</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => handleFileUpload(e, -1)}
                    disabled={uploadingIdx !== null}
                  />
                </label>
              )}
            </div>
          </div>

          {/* ── SECCIÓN 3: Características ── */}
          <div className="pf-section">
            <h3 className="pf-section-title">Características</h3>
            <p className="pf-section-desc">
              Especificaciones técnicas del producto. Las que pongas como "N/A" no aparecerán en la página.
            </p>

            {form.features.length === 0 && (
              <p className="pf-empty-hint">No hay características. Usá el botón para agregar.</p>
            )}

            <div className="pf-features-list">
              {form.features.map((feat, idx) => (
                <div key={idx} className="pf-feature-row">
                  <input
                    type="text"
                    value={feat.label}
                    onChange={e => updateFeature(idx, "label", e.target.value)}
                    placeholder="Ej: Material"
                    className="pf-feature-label"
                  />
                  <span className="pf-feature-sep">:</span>
                  <input
                    type="text"
                    value={feat.value}
                    onChange={e => updateFeature(idx, "value", e.target.value)}
                    placeholder='Ej: Plástico ABS  (ponés "N/A" para ocultar)'
                    className={`pf-feature-value ${feat.value === "N/A" ? "is-na" : ""}`}
                  />
                  <button
                    type="button"
                    className="pf-feature-na"
                    title="Marcar como N/A (no aparece en la página)"
                    onClick={() => updateFeature(idx, "value", feat.value === "N/A" ? "" : "N/A")}
                  >
                    {feat.value === "N/A" ? "Desmarcar" : "N/A"}
                  </button>
                  <button
                    type="button"
                    className="pf-feature-del"
                    onClick={() => removeFeature(idx)}
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="pf-btn-add-feature" onClick={addFeature}>
              <MdAdd size={16} /> Agregar característica
            </button>
          </div>

          {/* ── SECCIÓN 4: Variantes ── */}
          <div className="pf-section">
            <h3 className="pf-section-title">Variantes</h3>
            <p className="pf-section-desc">
              Colores, tallas u opciones que el cliente puede elegir. Ej: Rojo, Azul, XS, M, L.
            </p>

            <div className="pf-variants-tags">
              {form.variants.map(v => (
                <span key={v} className="pf-variant-tag">
                  {v}
                  <button type="button" onClick={() => removeVariant(v)}><MdClose size={13} /></button>
                </span>
              ))}
            </div>

            <div className="pf-variant-add-row">
              <input
                type="text"
                value={newVariant}
                onChange={e => setNewVariant(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addVariant())}
                placeholder="Ej: Rojo"
                maxLength={40}
              />
              <button type="button" className="pf-btn-add-variant" onClick={addVariant}>
                <MdAdd size={16} /> Agregar
              </button>
            </div>
          </div>

          {/* ── SECCIÓN 5: Estado ── */}
          <div className="pf-section pf-section--inline">
            <h3 className="pf-section-title">Estado de la publicación</h3>
            <label className="pf-toggle">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => set("is_active", e.target.checked)}
              />
              <span className="pf-toggle-slider" />
              <span className="pf-toggle-label">{form.is_active ? "Activa — visible para clientes" : "Pausada — oculta para clientes"}</span>
            </label>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="pf-error">
              <MdError size={16} /> {error}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="pf-footer">
            <button type="button" className="pf-btn-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="pf-btn-save" disabled={saving}>
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Publicar producto"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
