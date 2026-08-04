import { createFileRoute } from "@tanstack/react-router"
import ResetPasswordPage from "@/pages/auth/reset-password"

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
  component: ResetPasswordPage,
})
