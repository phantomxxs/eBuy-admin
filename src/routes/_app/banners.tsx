import { createFileRoute } from "@tanstack/react-router"
import BannersPage from "@/pages/banners"

export const Route = createFileRoute("/_app/banners")({ component: BannersPage })
