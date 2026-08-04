import { createFileRoute } from "@tanstack/react-router"
import ProductsPage from "@/pages/products"

export const Route = createFileRoute("/_app/products/")({ component: ProductsPage })
