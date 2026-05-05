import { billing } from "../../data/adminData"

function fmt(n) {
  return "$" + n.toLocaleString("es-AR")
}

const invoiceStatusColor = {
  Pagada: "badge-green",
  Pendiente: "badge-yellow",
  Anulada: "badge-red",
}

export default function BillingSummary() {
  const { currentMonth, invoices } = billing

  return (
    <div className="billing-wrap">
      {/* Cards resumen */}
      <div className="billing-cards">
        <div className="billing-card">
          <p className="billing-card-label">Total bruto</p>
          <p className="billing-card-value">{fmt(currentMonth.bruto)}</p>
        </div>
        <div className="billing-card billing-card--tax">
          <p className="billing-card-label">Impuestos (21%)</p>
          <p className="billing-card-value">{fmt(currentMonth.impuestos)}</p>
        </div>
        <div className="billing-card billing-card--neto">
          <p className="billing-card-label">Total neto</p>
          <p className="billing-card-value">{fmt(currentMonth.neto)}</p>
        </div>
        <div className="billing-card">
          <p className="billing-card-label">Facturas emitidas</p>
          <p className="billing-card-value">{currentMonth.facturas}</p>
          <div className="billing-status-row">
            <span className="admin-badge badge-green">✓ {currentMonth.pagadas} Pagadas</span>
            <span className="admin-badge badge-yellow">⏳ {currentMonth.pendientes} Pendientes</span>
            <span className="admin-badge badge-red">✕ {currentMonth.anuladas} Anuladas</span>
          </div>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <div className="admin-table-header">
          <h3>Últimas facturas</h3>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° Factura</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td><code className="order-id">{inv.id}</code></td>
                  <td>{inv.cliente}</td>
                  <td>{inv.fecha}</td>
                  <td><strong>{fmt(inv.monto)}</strong></td>
                  <td>
                    <span className={`admin-badge ${invoiceStatusColor[inv.estado]}`}>
                      {inv.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
