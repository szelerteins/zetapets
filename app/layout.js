import { CartProvider } from "../context/CartContext"
import { AuthProvider } from "../context/AuthContext"
import Header from "../components/Header"
import AnnouncementBar from "../components/AnnouncementBar"
import Footer from "../components/Footer"
import Toast from "../components/Toast"
import WhatsAppButton from "../components/WhatsAppButton"
import "../styles/globals.css"
import "../styles/admin.css"

export const metadata = {
  title: "ZetaPets - Todo para tu mascota",
  description:
    "Tienda online de productos inteligentes para mascotas. Alimentación, paseo, higiene y tecnología.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            <AnnouncementBar />
            <Header />
            <main>{children}</main>
            <Footer />
            <Toast />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
