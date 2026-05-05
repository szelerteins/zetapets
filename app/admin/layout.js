import "../../styles/admin.css"

export const metadata = {
  title: "Admin Panel - ZetaPets",
}

// Este layout reemplaza el layout global para todas las rutas /admin/*
// No incluye Header, Footer ni AnnouncementBar del sitio público
export default function AdminRootLayout({ children }) {
  return children
}
