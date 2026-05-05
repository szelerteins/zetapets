"use client"

import AdminLayout from "../../../../components/admin/AdminLayout"
import ProductsTable from "../../../../components/admin/ProductsTable"
import { TopProductsChart } from "../../../../components/admin/SalesChart"

export default function ProductosPage() {
  return (
    <AdminLayout title="Gestión de Productos">
      <TopProductsChart />
      <ProductsTable />
    </AdminLayout>
  )
}
