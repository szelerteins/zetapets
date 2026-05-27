"use client"

import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { getShippingCost, PICKUP_INFO, FREE_SHIPPING_THRESHOLD } from "../lib/shipping-zones"
import {
  MdOutlineLocalShipping,
  MdOutlineStorefront,
  MdOutlineLocationOn,
  MdOutlineInventory2,
  MdOutlineLock,
  MdOutlineShoppingCart,
  MdOutlineWarningAmber,
} from "react-icons/md"

function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR")
}

function StepIndicator({ step }) {
  return (
    <div className="step-indicator">
      <div className={`step-item ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
        <div className="step-circle">{step > 1 ? "✓" : "1"}</div>
        <span>Datos personales</span>
      </div>
      <div className={`step-line ${step > 1 ? "done" : ""}`} />
      <div className={`step-item ${step >= 2 ? "active" : ""}`}>
        <div className="step-circle">2</div>
        <span>Confirmar y pagar</span>
      </div>
    </div>
  )
}

function Step1({ data, onChange, deliveryMethod, setDeliveryMethod, onNext, shippingCost }) {
  const [errors, setErrors] = useState({})
  const isPickup = deliveryMethod === "pickup"

  function validate() {
    const e = {}
    if (!data.nombre.trim())   e.nombre   = "El nombre es requerido"
    if (!data.apellido.trim()) e.apellido = "El apellido es requerido"
    if (!data.email.trim())    e.email    = "El email es requerido"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Email inválido"
    if (!data.telefono.trim()) e.telefono = "El teléfono es requerido"
    if (!isPickup) {
      if (!data.direccion.trim())    e.direccion    = "La dirección es requerida"
      if (!data.ciudad.trim())       e.ciudad       = "La ciudad es requerida"
      if (!data.codigoPostal.trim()) e.codigoPostal = "El código postal es requerido"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function field(name, label, type = "text", placeholder = "") {
    return (
      <div className="form-group">
        <label htmlFor={name}>{label}</label>
        <input
          id={name} name={name} type={type} placeholder={placeholder}
          value={data[name]}
          onChange={(e) => onChange(name, e.target.value)}
          className={errors[name] ? "input-error" : ""}
          autoComplete={name}
        />
        {errors[name] && <span className="field-error">{errors[name]}</span>}
      </div>
    )
  }

  return (
    <div className="checkout-step">
      <h2 className="step-title">
        <span className="step-num">1</span>
        Datos de entrega
      </h2>

      {/* Selector de método de entrega */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          type="button"
          onClick={() => setDeliveryMethod("shipping")}
          style={{
            flex: 1, padding: "14px", borderRadius: "10px", border: "2px solid",
            borderColor: deliveryMethod === "shipping" ? "var(--celeste-dark)" : "#e2e8f0",
            background: deliveryMethod === "shipping" ? "#eff6ff" : "#fff",
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}><MdOutlineLocalShipping size={16} /> Envío a domicilio</p>
          <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
            Calculado según tu CP
          </p>
        </button>
        <button
          type="button"
          onClick={() => setDeliveryMethod("pickup")}
          style={{
            flex: 1, padding: "14px", borderRadius: "10px", border: "2px solid",
            borderColor: deliveryMethod === "pickup" ? "var(--verde-dark)" : "#e2e8f0",
            background: deliveryMethod === "pickup" ? "#f0fdf4" : "#fff",
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}><MdOutlineStorefront size={16} /> Retiro en local</p>
          <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}>
            Gratis · Villa Crespo, CABA
          </p>
        </button>
      </div>

      <div className="form-row">
        {field("nombre",   "Nombre *",   "text", "Juan")}
        {field("apellido", "Apellido *", "text", "García")}
      </div>
      {field("email",    "Email *",    "email", "juan@email.com")}
      {field("telefono", "Teléfono *", "tel",   "+54 9 11 XXXX-XXXX")}

      {!isPickup && (
        <>
          {field("direccion", "Dirección *", "text", "Av. Corrientes 1234")}
          <div className="form-row">
            {field("ciudad",       "Ciudad *",        "text", "Buenos Aires")}
            {field("codigoPostal", "Código postal *", "text", "C1043")}
          </div>
          {data.codigoPostal.trim() && (
            <p style={{ fontSize: "0.84rem", color: "var(--celeste-dark)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <MdOutlineInventory2 size={14} /> Costo de envío:{" "}
              <strong>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</strong>
            </p>
          )}
        </>
      )}

      {isPickup && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px 16px", marginTop: "4px" }}>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#166534", display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <MdOutlineLocationOn size={16} style={{ flexShrink: 0, marginTop: "2px" }} /> <span><strong>Villa Crespo, CABA</strong><br />
            <span style={{ fontSize: "0.82rem", color: "#15803d" }}>{PICKUP_INFO.note}</span></span>
          </p>
        </div>
      )}

      <button className="btn btn-primary btn-lg checkout-next-btn" onClick={() => { if (validate()) onNext() }}>
        Continuar →
      </button>
    </div>
  )
}

function Step2({ data, deliveryMethod, onBack, onConfirm, subtotal, shippingCost, total, loading, couponActive }) {
  const isPickup = deliveryMethod === "pickup"
  const discountAmount = couponActive ? Math.round(subtotal * 0.1) : 0

  return (
    <div className="checkout-step">
      <h2 className="step-title">
        <span className="step-num">2</span>
        Confirmar y pagar
      </h2>

      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", fontSize: "0.9rem", lineHeight: 1.7 }}>
        {isPickup ? (
          <>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}><MdOutlineStorefront size={16} /> Retiro en local</p>
            <p style={{ margin: 0, color: "#475569" }}>
              {data.nombre} {data.apellido}<br />
              Villa Crespo, CABA · Tel: {data.telefono}<br />
              <em style={{ fontSize: "0.82rem", color: "#64748b" }}>{PICKUP_INFO.note}</em>
            </p>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}><MdOutlineLocationOn size={16} /> Envío a:</p>
            <p style={{ margin: 0, color: "#475569" }}>
              {data.nombre} {data.apellido}<br />
              {data.direccion}, {data.ciudad}<br />
              CP: {data.codigoPostal} · Tel: {data.telefono}
            </p>
          </>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#64748b" }}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {couponActive && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#b45309", fontWeight: 600 }}>
            <span>🎂 Descuento cumpleaños (-10%)</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#64748b" }}>
          <span>{isPickup ? "Retiro en local" : "Envío"}</span>
          <span style={{ color: "var(--verde-dark)", fontWeight: 700 }}>
            {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px", fontWeight: 700, fontSize: "1.05rem", borderTop: "2px solid #e2e8f0" }}>
          <span>Total a pagar</span>
          <strong style={{ color: "var(--celeste-dark)" }}>{formatPrice(total)}</strong>
        </div>
      </div>

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "0.83rem", color: "#78350f", display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <MdOutlineLock size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
        <span>Serás redirigido a <strong>Mercado Pago</strong> para completar el pago de forma segura.
        Aceptamos tarjetas, transferencia y saldo de MP.</span>
      </div>

      <div className="checkout-actions">
        <button className="btn btn-outline" onClick={onBack}>← Volver</button>
        <button
          className="btn btn-green btn-lg"
          onClick={onConfirm}
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? "Generando link..." : "Pagar con Mercado Pago"}
        </button>
      </div>
    </div>
  )
}

export default function CheckoutSteps({ deliveryMethod: propMethod, setDeliveryMethod: propSetMethod, onCodigoPostalChange }) {
  const { totalPrice, cart, clearCart } = useCart()
  const { user, profile }               = useAuth()
  const [step, setStep]                 = useState(1)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState("")
  const [ownMethod, setOwnMethod]       = useState("shipping")

  // Si el padre pasa el estado, usamos el del padre; si no, usamos el propio
  const deliveryMethod    = propMethod    !== undefined ? propMethod    : ownMethod
  const setDeliveryMethod = propSetMethod !== undefined ? propSetMethod : setOwnMethod

  const [userData, setUserData] = useState({
    nombre: "", apellido: "", email: "",
    telefono: "", direccion: "", ciudad: "", codigoPostal: "",
  })

  const [couponCode, setCouponCode]     = useState("")
  const [couponStatus, setCouponStatus] = useState("idle") // idle | checking | valid | invalid
  const [couponError, setCouponError]   = useState("")

  // Autocompletar con datos del perfil del usuario logueado
  useEffect(() => {
    if (!user) return
    const [firstName, ...rest] = ((profile?.full_name) || user.nombre || "").split(" ")
    setUserData((prev) => ({
      nombre:       prev.nombre       || firstName || "",
      apellido:     prev.apellido     || rest.join(" ") || user.apellido || "",
      email:        prev.email        || user.email || "",
      telefono:     prev.telefono     || profile?.phone       || "",
      direccion:    prev.direccion    || profile?.address     || "",
      ciudad:       prev.ciudad       || profile?.city        || "",
      codigoPostal: prev.codigoPostal || profile?.postal_code || "",
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.user_id])

  // Auto-aplicar código de descuento del perfil si no venció
  useEffect(() => {
    if (!profile?.discount_code || !profile?.discount_expires_at) return
    if (new Date(profile.discount_expires_at) > new Date()) {
      setCouponCode(profile.discount_code)
      setCouponStatus("valid")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.discount_code])

  const couponActive   = couponStatus === "valid"
  const discountAmount = couponActive ? Math.round(totalPrice * 0.1) : 0
  const effectivePrice = totalPrice - discountAmount

  function handleChange(field, value) {
    setUserData((prev) => ({ ...prev, [field]: value }))
    if (field === "codigoPostal" && onCodigoPostalChange) onCodigoPostalChange(value)
  }

  async function handleCouponApply() {
    if (!couponCode.trim()) return
    setCouponStatus("checking")
    setCouponError("")
    try {
      const res = await fetch("/api/discount/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      })
      const json = await res.json()
      if (res.ok && json.valid) {
        setCouponStatus("valid")
      } else {
        setCouponStatus("invalid")
        setCouponError(json.error || "Código inválido o vencido")
      }
    } catch {
      setCouponStatus("invalid")
      setCouponError("Error al validar el código")
    }
  }

  const shippingCost = getShippingCost(userData.codigoPostal, totalPrice, deliveryMethod)
  const total        = effectivePrice + shippingCost

  async function handleConfirm() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/payments/create-preference", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items:         cart,
          buyer:         userData,
          cartTotal:     totalPrice,
          deliveryMethod,
          discountCode:  couponActive ? couponCode.trim().toUpperCase() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.init_point) {
        throw new Error(data.error || "No se pudo generar el link de pago")
      }
      clearCart()
      window.location.href = data.init_point
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  if (cart.length === 0 && step === 1) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <MdOutlineShoppingCart size={56} style={{ color: "var(--text-light)", margin: "0 auto" }} />
        <p style={{ fontWeight: 700, marginTop: "12px" }}>Tu carrito está vacío</p>
      </div>
    )
  }

  return (
    <div className="checkout-wrapper">
      <StepIndicator step={step} />

      {/* Campo de código de descuento */}
      <div style={{ marginBottom: "16px" }}>
        <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>
          ¿Tenés un código de descuento?
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase())
              if (couponStatus !== "idle") { setCouponStatus("idle"); setCouponError("") }
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleCouponApply() }}
            placeholder="ZETA______"
            style={{
              flex: 1, padding: "10px 12px", borderRadius: "8px",
              border: `1.5px solid ${couponStatus === "valid" ? "#22c55e" : couponStatus === "invalid" ? "#ef4444" : "#e2e8f0"}`,
              fontSize: "0.95rem", fontFamily: "monospace", letterSpacing: "0.06em",
              outline: "none", textTransform: "uppercase",
            }}
          />
          <button
            type="button"
            onClick={handleCouponApply}
            disabled={couponStatus === "checking" || !couponCode.trim()}
            style={{
              padding: "10px 18px", borderRadius: "8px", border: "none",
              background: couponStatus === "checking" ? "#94a3b8" : "var(--celeste-dark, #0ea5e9)",
              color: "#fff", fontWeight: 700,
              cursor: couponStatus === "checking" || !couponCode.trim() ? "default" : "pointer",
              fontSize: "0.9rem", transition: "background 0.15s", whiteSpace: "nowrap",
            }}
          >
            {couponStatus === "checking" ? "..." : "Aplicar"}
          </button>
        </div>
        {couponStatus === "valid" && (
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#16a34a", fontWeight: 600 }}>
            ✓ Código aplicado — 10% de descuento en toda la compra
          </p>
        )}
        {couponStatus === "invalid" && (
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#dc2626" }}>
            {couponError}
          </p>
        )}
      </div>

      {/* Banner de descuento activo */}
      {couponActive && (
        <div style={{
          background: "linear-gradient(135deg,#fef3c7,#fde68a)",
          border: "2px solid #f59e0b", borderRadius: "10px",
          padding: "14px 18px", marginBottom: "18px",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <span style={{ fontSize: "1.6rem" }}>🎂</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "#92400e", fontSize: "0.95rem" }}>
              ¡Descuento de cumpleaños activo!
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#78350f" }}>
              10% de descuento aplicado en esta compra
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#dc2626", fontSize: "0.9rem", display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <MdOutlineWarningAmber size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <Step1
          data={userData}
          onChange={handleChange}
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
          onNext={() => setStep(2)}
          shippingCost={shippingCost}
        />
      )}

      {step === 2 && (
        <Step2
          data={userData}
          deliveryMethod={deliveryMethod}
          onBack={() => setStep(1)}
          onConfirm={handleConfirm}
          subtotal={totalPrice}
          shippingCost={shippingCost}
          total={total}
          loading={loading}
          couponActive={couponActive}
        />
      )}
    </div>
  )
}
