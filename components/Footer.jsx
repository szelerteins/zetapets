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
              <li>zetapets.ar@gmail.com</li>
              <li>+5491131451107</li>
              <li>Buenos Aires, Argentina</li>
              <li><a href="https://instagram.com/zetapets.ar" target="_blank" rel="noopener noreferrer">Instagram: @zetapets.ar</a></li>
              <li><a href="https://tiktok.com/@zetapets2" target="_blank" rel="noopener noreferrer">TikTok: @zetapets2</a></li>
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
