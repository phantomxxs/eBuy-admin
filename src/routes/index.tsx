import { createFileRoute, redirect } from "@tanstack/react-router"
import { ROUTES } from "@/lib/routes"

export const Route = createFileRoute("/")({
  loader: async () => {
    throw redirect({ to: ROUTES.dashboard })
  },
})
