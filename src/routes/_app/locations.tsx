import { createFileRoute } from "@tanstack/react-router"
import LocationsPage from "@/pages/locations"

export const Route = createFileRoute("/_app/locations")({ component: LocationsPage })
