import { createFileRoute } from "@tanstack/react-router"
import DiscountsPage from "@/pages/discounts"

export const Route = createFileRoute("/_app/discounts")({ component: DiscountsPage })
