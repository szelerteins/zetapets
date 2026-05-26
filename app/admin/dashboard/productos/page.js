"use client"

import { useState } from "react"
import AdminLayout from "../../../../components/admin/AdminLayout"
import ProductsTable from "../../../../components/admin/ProductsTable"
import { TopProductsChart } from "../../../../components/admin/SalesChart"
import ProductForm from "../../../../components/admin/ProductForm"

export default function ProductosPage() {
  const [formMode, setFormMode] = useState(null)
  const [editProduct, setEditProduct] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleNew() {
    setEditProduct(null)
    setFormMode("create")
  }

  function handleEdit(product) {
    setEditProduct(product)
    setFormMode("edit")
  }

  function handleClose() {
    setFormMode(null)
    setEditProduct(null)
  }

  function handleSaved() {
    setFormMode(null)
    setEditProduct(null)
    setRefreshKey(k => k + 1)
  }

  return (
    <AdminLayout title="Gestión de Productos">
      <TopProductsChart />
      <ProductsTable
        refreshKey={refreshKey}
        onEdit={handleEdit}
        onNew={handleNew}
      />
      {formMode && (
        <ProductForm
          mode={formMode}
          product={editProduct}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </AdminLayout>
  )
}
