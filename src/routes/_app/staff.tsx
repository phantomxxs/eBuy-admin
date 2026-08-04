import { createFileRoute } from "@tanstack/react-router"
import StaffPage from "@/pages/staff"

export const Route = createFileRoute("/_app/staff")({ component: StaffPage })
