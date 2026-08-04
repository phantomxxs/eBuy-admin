import { createFileRoute } from "@tanstack/react-router"
import ProductBulkUploadPage from "@/pages/products/bulk-upload"

export const Route = createFileRoute("/_app/products/bulk-upload")({
  component: ProductBulkUploadPage,
})
