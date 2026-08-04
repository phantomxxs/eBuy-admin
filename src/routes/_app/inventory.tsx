import { createFileRoute } from "@tanstack/react-router"
import InventoryPage from "@/pages/inventory"

export const Route = createFileRoute("/_app/inventory")({ component: InventoryPage })
