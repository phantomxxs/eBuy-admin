import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import AcceptInvitePage from "@/pages/auth/accept-invite"

export const Route = createFileRoute("/accept-invite")({
  validateSearch: z.object({ token: z.string().catch("") }),
  component: AcceptInvitePage,
})
