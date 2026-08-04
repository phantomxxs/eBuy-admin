import { HeadContent, Link, Scripts, createRootRouteWithContext } from "@tanstack/react-router"
import { ROUTES } from "@/lib/routes"
import { NuqsAdapter } from "nuqs/adapters/tanstack-router"
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import EBuyAlertContainer from "@/components/ui/ebuy-alert-container"

import appCss from "../styles.css?url"

import type { QueryClient } from "@tanstack/react-query"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "eBuy Admin Dashboard",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
    ],
  }),
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="font-jakarta text-brand/40 text-xs font-semibold tracking-widest uppercase">
        404
      </p>
      <h1 className="text-brand font-sans text-2xl font-semibold">Page not found</h1>
      <p className="font-jakarta text-brand/55 text-sm">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to={ROUTES.dashboard}
        className="font-jakarta text-primary text-sm font-semibold hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="selection:bg-selection font-sans wrap-anywhere antialiased">
        <TanStackQueryProvider>
          <TooltipProvider>
            <NuqsAdapter>
              <ErrorBoundary>{children}</ErrorBoundary>
              <EBuyAlertContainer />
            </NuqsAdapter>
          </TooltipProvider>
        </TanStackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
