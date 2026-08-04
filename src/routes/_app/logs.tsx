import { createFileRoute } from "@tanstack/react-router"
import LogsPage from "@/pages/logs/index"

export const Route = createFileRoute("/_app/logs")({ component: LogsPage })
