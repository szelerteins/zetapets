"use client"

import AdminLayout from "../../../../components/admin/AdminLayout"
import BillingSummary from "../../../../components/admin/BillingSummary"
import { RevenueBarChart } from "../../../../components/admin/SalesChart"

export default function FacturacionPage() {
  return (
    <AdminLayout title="Facturación">
      <RevenueBarChart />
      <BillingSummary />
    </AdminLayout>
  )
}
