import { Suspense } from "react"
import OrderConfirmation from "../../components/OrderConfirmation"

export const metadata = {
  title: "Compra confirmada - ZetaPets",
}

export default function ConfirmacionPage() {
  return (
    <section style={{ padding: "0 0 80px" }}>
      <div className="container">
        <Suspense fallback={<div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>Cargando…</div>}>
          <OrderConfirmation />
        </Suspense>
      </div>
    </section>
  )
}
