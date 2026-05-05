/**
 * DATOS SIMULADOS PARA EL PANEL DE ADMINISTRADOR
 *
 * IMPORTANTE (Seguridad):
 * - Todos estos datos son simulados. En producción deben venir de una API o base de datos.
 * - Las credenciales de acceso NO deben estar en el frontend en producción.
 * - La autenticación real debe implementarse con backend + JWT o NextAuth.js
 * - Los datos financieros reales deben protegerse con roles y permisos en el servidor.
 */

// ─── MÉTRICAS GENERALES ─────────────────────────────────────────────────────
export const metrics = {
  totalSales: 847,
  totalRevenue: 38420500,
  totalOrders: 312,
  avgTicket: 123144,
  abandonedCarts: 89,
  registeredClients: 534,
  conversionRate: 3.68,
  topProduct: "Comedero Automático V2",
}

// ─── VENTAS POR DÍA (últimos 14 días) ────────────────────────────────────────
export const salesByDay = [
  { day: "22 Abr", ventas: 18, facturacion: 1820000 },
  { day: "23 Abr", ventas: 24, facturacion: 2430000 },
  { day: "24 Abr", ventas: 15, facturacion: 1540000 },
  { day: "25 Abr", ventas: 31, facturacion: 3120000 },
  { day: "26 Abr", ventas: 28, facturacion: 2870000 },
  { day: "27 Abr", ventas: 22, facturacion: 2240000 },
  { day: "28 Abr", ventas: 19, facturacion: 1960000 },
  { day: "29 Abr", ventas: 35, facturacion: 3580000 },
  { day: "30 Abr", ventas: 41, facturacion: 4150000 },
  { day: "01 May", ventas: 27, facturacion: 2760000 },
  { day: "02 May", ventas: 33, facturacion: 3340000 },
  { day: "03 May", ventas: 38, facturacion: 3840000 },
  { day: "04 May", ventas: 29, facturacion: 2940000 },
  { day: "05 May", ventas: 44, facturacion: 4460000 },
]

// ─── FACTURACIÓN MENSUAL ──────────────────────────────────────────────────────
export const revenueByMonth = [
  { mes: "Nov",  facturacion: 18200000 },
  { mes: "Dic",  facturacion: 31500000 },
  { mes: "Ene",  facturacion: 22800000 },
  { mes: "Feb",  facturacion: 19400000 },
  { mes: "Mar",  facturacion: 27600000 },
  { mes: "Abr",  facturacion: 38420500 },
]

// ─── PRODUCTOS MÁS VENDIDOS ───────────────────────────────────────────────────
export const topProducts = [
  { name: "Comedero Automático V2",    ventas: 87, porcentaje: 28 },
  { name: "Rastreador GPS",            ventas: 64, porcentaje: 20 },
  { name: "Dispenser de Comida",       ventas: 58, porcentaje: 18 },
  { name: "Botella Portátil",          ventas: 43, porcentaje: 14 },
  { name: "Bebedero de Agua",          ventas: 38, porcentaje: 12 },
  { name: "Collar con AirTag",         ventas: 25, porcentaje: 8  },
]

// ─── ESTADO DE PEDIDOS ────────────────────────────────────────────────────────
export const ordersByStatus = [
  { status: "Entregado",  cantidad: 198, color: "#7AC74F" },
  { status: "Enviado",    cantidad: 67,  color: "#5BC0EB" },
  { status: "Pendiente",  cantidad: 34,  color: "#F59E0B" },
  { status: "Cancelado",  cantidad: 13,  color: "#EF4444" },
]

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────
export const orders = [
  {
    id: "ZP-192847",
    cliente: "Martina García",
    email: "martina@gmail.com",
    fecha: "05/05/2026",
    productos: ["Comedero Automático V2 (Blanco)"],
    total: 79990,
    estado: "Enviado",
    pago: "Transferencia",
    direccion: "Av. Corrientes 1234, CABA",
  },
  {
    id: "ZP-192846",
    cliente: "Lucas Fernández",
    email: "lucas.f@hotmail.com",
    fecha: "05/05/2026",
    productos: ["Rastreador GPS", "Collar con AirTag (M)"],
    total: 82980,
    estado: "Pendiente",
    pago: "MercadoPago",
    direccion: "San Martín 567, Rosario",
  },
  {
    id: "ZP-192845",
    cliente: "Sofía Torres",
    email: "sofi.torres@gmail.com",
    fecha: "04/05/2026",
    productos: ["Dispenser de Comida", "Filtro para Bebedero"],
    total: 57980,
    estado: "Entregado",
    pago: "Tarjeta",
    direccion: "Belgrano 890, Córdoba",
  },
  {
    id: "ZP-192844",
    cliente: "Diego Ramírez",
    email: "diegoram@gmail.com",
    fecha: "04/05/2026",
    productos: ["Botella Portátil (Verde)", "Llavero ZetaPets (Negro)"],
    total: 25980,
    estado: "Entregado",
    pago: "Transferencia",
    direccion: "Italia 234, Mendoza",
  },
  {
    id: "ZP-192843",
    cliente: "Valentina López",
    email: "valen.lopez@gmail.com",
    fecha: "03/05/2026",
    productos: ["Comedero y Bebedero Automático V2 (Amarillo)"],
    total: 79990,
    estado: "Entregado",
    pago: "MercadoPago",
    direccion: "Salta 112, Buenos Aires",
  },
  {
    id: "ZP-192842",
    cliente: "Ignacio Suárez",
    email: "nacho.suarez@outlook.com",
    fecha: "03/05/2026",
    productos: ["Rastreador GPS"],
    total: 69990,
    estado: "Cancelado",
    pago: "Tarjeta",
    direccion: "Tucumán 678, La Plata",
  },
  {
    id: "ZP-192841",
    cliente: "Camila Herrera",
    email: "cami.herrera@gmail.com",
    fecha: "02/05/2026",
    productos: ["Bebedero de Agua (Blanco)", "Filtro para Bebedero"],
    total: 29980,
    estado: "Entregado",
    pago: "Transferencia",
    direccion: "Rivadavia 456, Mar del Plata",
  },
  {
    id: "ZP-192840",
    cliente: "Tomás Giménez",
    email: "tomas.gim@gmail.com",
    fecha: "02/05/2026",
    productos: ["AirTag (Blanco)", "Collar con AirTag (L)"],
    total: 42980,
    estado: "Enviado",
    pago: "MercadoPago",
    direccion: "San Juan 321, Santa Fe",
  },
]

// ─── FACTURACIÓN ──────────────────────────────────────────────────────────────
export const billing = {
  currentMonth: {
    bruto: 38420500,
    impuestos: 8052305,
    neto: 30368195,
    facturas: 312,
    pagadas: 278,
    pendientes: 25,
    anuladas: 9,
  },
  invoices: [
    { id: "F-001892", cliente: "Martina García",   fecha: "05/05/2026", monto: 79990,  estado: "Pagada"    },
    { id: "F-001891", cliente: "Lucas Fernández",   fecha: "05/05/2026", monto: 82980,  estado: "Pendiente" },
    { id: "F-001890", cliente: "Sofía Torres",      fecha: "04/05/2026", monto: 57980,  estado: "Pagada"    },
    { id: "F-001889", cliente: "Diego Ramírez",     fecha: "04/05/2026", monto: 25980,  estado: "Pagada"    },
    { id: "F-001888", cliente: "Valentina López",   fecha: "03/05/2026", monto: 79990,  estado: "Pagada"    },
    { id: "F-001887", cliente: "Ignacio Suárez",    fecha: "03/05/2026", monto: 69990,  estado: "Anulada"   },
    { id: "F-001886", cliente: "Camila Herrera",    fecha: "02/05/2026", monto: 29980,  estado: "Pagada"    },
    { id: "F-001885", cliente: "Tomás Giménez",     fecha: "02/05/2026", monto: 42980,  estado: "Pendiente" },
  ],
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
export const clients = [
  { id: 1, nombre: "Martina García",   email: "martina@gmail.com",        pedidos: 4, gasto: 289960, ciudad: "CABA",        estado: "Activo"  },
  { id: 2, nombre: "Lucas Fernández",  email: "lucas.f@hotmail.com",      pedidos: 2, gasto: 152980, ciudad: "Rosario",     estado: "Activo"  },
  { id: 3, nombre: "Sofía Torres",     email: "sofi.torres@gmail.com",    pedidos: 6, gasto: 387900, ciudad: "Córdoba",     estado: "Activo"  },
  { id: 4, nombre: "Diego Ramírez",    email: "diegoram@gmail.com",       pedidos: 3, gasto: 98700,  ciudad: "Mendoza",     estado: "Activo"  },
  { id: 5, nombre: "Valentina López",  email: "valen.lopez@gmail.com",    pedidos: 5, gasto: 312450, ciudad: "Buenos Aires",estado: "Activo"  },
  { id: 6, nombre: "Ignacio Suárez",   email: "nacho.suarez@outlook.com", pedidos: 1, gasto: 0,      ciudad: "La Plata",    estado: "Inactivo"},
  { id: 7, nombre: "Camila Herrera",   email: "cami.herrera@gmail.com",   pedidos: 7, gasto: 445800, ciudad: "Mar del Plata",estado: "Activo" },
  { id: 8, nombre: "Tomás Giménez",    email: "tomas.gim@gmail.com",      pedidos: 2, gasto: 115960, ciudad: "Santa Fe",    estado: "Activo"  },
]

// ─── ANALYTICS (SIMULADO) ──────────────────────────────────────────────────────
/**
 * NOTA: Para conectar Google Analytics real, agregar en .env.local:
 * NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 * Luego instalar: npm install @next/third-parties
 * Y en app/layout.js: import { GoogleAnalytics } from '@next/third-parties/google'
 */
export const analytics = {
  activeUsers: 47,
  pageViews: 12840,
  avgSessionDuration: "2m 34s",
  bounceRate: 38.4,
  trafficSources: [
    { source: "Google",        porcentaje: 42, visitas: 5393, color: "#7AC74F" },
    { source: "Directo",       porcentaje: 28, visitas: 3595, color: "#5BC0EB" },
    { source: "Redes Sociales",porcentaje: 19, visitas: 2440, color: "#F59E0B" },
    { source: "Referidos",     porcentaje: 11, visitas: 1412, color: "#8B5CF6" },
  ],
  topPages: [
    { page: "/",           visitas: 4820, tiempo: "1m 48s" },
    { page: "/productos",  visitas: 3640, tiempo: "3m 12s" },
    { page: "/categorias", visitas: 1920, tiempo: "2m 05s" },
    { page: "/checkout",   visitas: 980,  tiempo: "4m 30s" },
    { page: "/contacto",   visitas: 560,  tiempo: "1m 22s" },
  ],
}
