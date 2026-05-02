import Link from "next/link"

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="logo footer-logo">
              🐾 Zeta<span>Pets</span>
            </Link>
            <p className="footer-desc">
              Productos inteligentes para mascotas felices. Diseño, tecnología y
              bienestar animal en cada compra.
            </p>
          </div>

          <div className="footer-col">
            <h4>Categorías</h4>
            <ul>
              {["Alimentación", "Paseo", "Higiene", "Tecnología", "Juguetes", "Gatos"].map(
                (cat) => (
                  <li key={cat}>
                    <Link href="/categorias">{cat}</Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Ayuda</h4>
            <ul>
              <li><Link href="/contacto">Preguntas frecuentes</Link></li>
              <li><Link href="/contacto">Envíos y entregas</Link></li>
              <li><Link href="/contacto">Devoluciones</Link></li>
              <li><Link href="/contacto">Términos y condiciones</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li>hola@zetapets.com</li>
              <li>+54 9 11 1234-5678</li>
              <li>Buenos Aires, Argentina</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ZetaPets. Todos los derechos reservados.</p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem" }}>
            Hecho con 🐾 para mascotas
          </p>
        </div>
      </div>
    </footer>
  )
}
