import { CartProvider } from "../context/CartContext"
import Header from "../components/Header"
import AnnouncementBar from "../components/AnnouncementBar"
import Footer from "../components/Footer"
import Toast from "../components/Toast"
import "../styles/globals.css"

export const metadata = {
  title: "ZetaPets - Todo para tu mascota",
  description:
    "Tienda online de productos inteligentes para mascotas. Alimentación, paseo, higiene y tecnología.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  )
}
