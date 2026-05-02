import OrderConfirmation from "../../components/OrderConfirmation"

export const metadata = {
  title: "Compra confirmada - ZetaPets",
}

export default function ConfirmacionPage() {
  return (
    <section style={{ padding: "0 0 80px" }}>
      <div className="container">
        <OrderConfirmation />
      </div>
    </section>
  )
}
