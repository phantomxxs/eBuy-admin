import { createFileRoute } from "@tanstack/react-router"
import TransactionsPage from "@/pages/transactions"

export const Route = createFileRoute("/_app/transactions")({ component: TransactionsPage })
