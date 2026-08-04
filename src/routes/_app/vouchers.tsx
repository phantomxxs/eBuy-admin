import { createFileRoute } from "@tanstack/react-router"
import VouchersPage from "@/pages/vouchers"

export const Route = createFileRoute("/_app/vouchers")({ component: VouchersPage })
