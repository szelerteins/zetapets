"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../context/CartContext"

const PAYMENT_OPTIONS = [
  { id: "tarjeta", label: "Tarjeta de crédito/débito", icon: "💳", desc: "Visa, Mastercard, American Express" },
  { id: "transferencia", label: "Transferencia bancaria", icon: "🏦", desc: "CBU / Alias bancario" },
  { id: "mercadopago", label: "Mercado Pago", icon: "🟦", desc: "Saldo, cuotas sin interés" },
]

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
        <span>Método de pago</span>
      </div>
    </div>
  )
}

function Step1({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!data.nombre.trim()) e.nombre = "El nombre es requerido"
    if (!data.apellido.trim()) e.apellido = "El apellido es requerido"
    if (!data.email.trim()) e.email = "El email es requerido"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Email inválido"
    if (!data.telefono.trim()) e.telefono = "El teléfono es requerido"
    if (!data.direccion.trim()) e.direccion = "La dirección es requerida"
    if (!data.codigoPostal.trim()) e.codigoPostal = "El código postal es requerido"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  function field(name, label, type = "text", placeholder = "") {
    return (
      <div className="form-group">
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
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

      <div className="form-row">
        {field("nombre", "Nombre *", "text", "Juan")}
        {field("apellido", "Apellido *", "text", "García")}
      </div>
      {field("email", "Email *", "email", "juan@email.com")}
      {field("telefono", "Teléfono *", "tel", "+54 9 11 XXXX-XXXX")}
      {field("direccion", "Dirección *", "text", "Av. Corrientes 1234, CABA")}
      {field("codigoPostal", "Código postal *", "text", "C1043")}

      <button className="btn btn-primary btn-lg checkout-next-btn" onClick={handleNext}>
        Continuar al pago →
      </button>
    </div>
  )
}

function Step2({ payment, setPayment, onBack, onConfirm, total, loading }) {
  return (
    <div className="checkout-step">
      <h2 className="step-title">
        <span className="step-num">2</span>
        Método de pago
      </h2>

      <div className="payment-options">
        {PAYMENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`payment-option ${payment === opt.id ? "selected" : ""}`}
            onClick={() => setPayment(opt.id)}
          >
            <span className="payment-icon">{opt.icon}</span>
            <div className="payment-info">
              <p className="payment-label">{opt.label}</p>
              <p className="payment-desc">{opt.desc}</p>
            </div>
            <span className={`payment-radio ${payment === opt.id ? "checked" : ""}`} />
          </button>
        ))}
      </div>

      <div className="checkout-total-preview">
        <span>Total a pagar</span>
        <strong>{formatPrice(total)}</strong>
      </div>

      <div className="checkout-actions">
        <button className="btn btn-outline" onClick={onBack}>
          ← Volver
        </button>
        <button
          className="btn btn-green btn-lg"
          onClick={onConfirm}
          disabled={!payment || loading}
          style={{ flex: 1 }}
        >
          {loading ? "Procesando..." : "✓ Confirmar compra"}
        </button>
      </div>
    </div>
  )
}

export default function CheckoutSteps() {
  const router = useRouter()
  const { totalPrice, placeOrder, cart } = useCart()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState("")

  const [userData, setUserData] = useState({
    nombre: "", apellido: "", email: "",
    telefono: "", direccion: "", codigoPostal: "",
  })

  function handleChange(field, value) {
    setUserData((prev) => ({ ...prev, [field]: value }))
  }

  const shipping = totalPrice >= 30000 ? 0 : 2990
  const total = totalPrice + shipping

  async function handleConfirm() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    placeOrder(userData, payment)
    setLoading(false)
    router.push("/confirmacion")
  }

  if (cart.length === 0 && step === 1) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ fontSize: "3rem" }}>🛒</p>
        <p style={{ fontWeight: 700, marginTop: "12px" }}>Tu carrito está vacío</p>
      </div>
    )
  }

  return (
    <div className="checkout-wrapper">
      <StepIndicator step={step} />

      {step === 1 && (
        <Step1
          data={userData}
          onChange={handleChange}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2
          payment={payment}
          setPayment={setPayment}
          onBack={() => setStep(1)}
          onConfirm={handleConfirm}
          total={total}
          loading={loading}
        />
      )}
    </div>
  )
}
