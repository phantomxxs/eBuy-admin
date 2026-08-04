import { createFileRoute } from "@tanstack/react-router"
import ReviewsPage from "@/pages/reviews"

export const Route = createFileRoute("/_app/reviews")({ component: ReviewsPage })
