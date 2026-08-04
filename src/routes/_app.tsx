import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import AppLayout from "@/components/shared/AppLayout"
import { clearAuthCookie, getAuthCookie } from "@/lib/auth-cookie"
import { ROUTES } from "@/lib/routes"
import { getMe } from "@/store/requests/auth"
import { useUserStore } from "@/store/user"

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!getAuthCookie()) {
      useUserStore.getState().clearUser()
      clearAuthCookie()
      throw redirect({ to: ROUTES.login })
    }
  },
  loader: async () => {
    // Always refresh user + permissions from /auth/me on app boot.
    // This ensures permissions are up-to-date regardless of how the user
    // landed here (fresh login, page refresh, or persisted session).
    const { setUser } = useUserStore.getState()
    try {
      const me = await getMe()
      setUser(me.user, me.permissions)
    } catch {}
  },
  component: AppLayoutWrapper,
})

function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
