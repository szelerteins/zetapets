"use client"

import AdminLayout from "../../../../components/admin/AdminLayout"

export default function ConfiguracionPage() {
  return (
    <AdminLayout title="Configuración">
      <div className="config-wrap">
        <div className="config-section">
          <h3>Información del negocio</h3>
          <div className="config-grid">
            <div className="admin-form-group">
              <label>Nombre del negocio</label>
              <input type="text" defaultValue="ZetaPets" />
            </div>
            <div className="admin-form-group">
              <label>Email de contacto</label>
              <input type="email" defaultValue="admin@zetapets.com" />
            </div>
            <div className="admin-form-group">
              <label>WhatsApp</label>
              <input type="text" defaultValue="+54 9 11 0000-0000" />
            </div>
            <div className="admin-form-group">
              <label>Dirección</label>
              <input type="text" defaultValue="Buenos Aires, Argentina" />
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Google Analytics</h3>
          <p className="config-desc">
            Para conectar Google Analytics, creá tu cuenta en{" "}
            <a href="https://analytics.google.com" target="_blank" rel="noreferrer">
              analytics.google.com
            </a>{" "}
            y copiá tu Measurement ID.
          </p>
          <div className="admin-form-group">
            <label>Google Analytics ID</label>
            <input type="text" placeholder="G-XXXXXXXXXX" />
            <small>Guardalo en tu <code>.env.local</code> como <code>NEXT_PUBLIC_GA_ID</code></small>
          </div>
        </div>

        <div className="config-section">
          <h3>Envíos</h3>
          <div className="config-grid">
            <div className="admin-form-group">
              <label>Envío gratis desde</label>
              <input type="number" defaultValue="60000" />
            </div>
            <div className="admin-form-group">
              <label>Costo de envío</label>
              <input type="number" defaultValue="2990" />
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Descuentos</h3>
          <div className="admin-form-group">
            <label>Descuento por transferencia (%)</label>
            <input type="number" defaultValue="10" />
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 8 }}
          onClick={() => alert("Configuración guardada (simulado)")}>
          Guardar cambios
        </button>
      </div>
    </AdminLayout>
  )
}
