import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/marketplace")({
  component: () => (
    <div className="page-bg font-jakarta text-brand/40 min-h-full p-8">
      Marketplace — coming soon
    </div>
  ),
})
