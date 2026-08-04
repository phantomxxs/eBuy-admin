import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { login, logout, getMe } from "@/store/requests/auth"
import { useUserStore } from "@/store/user"
import { setAuthCookie } from "@/lib/auth-cookie"
import { ROUTES } from "@/lib/routes"

export const useLogin = () => {
  const setUser = useUserStore((s) => s.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAuthCookie(response.token)
      setUser(response.user, response.permissions)
      navigate({ to: ROUTES.dashboard })
      // Refresh user data from /me in the background
      getMe()
        .then((me) => setUser(me.user, me.permissions))
        .catch(() => {})
    },
  })
}

export const useLogout = () => {
  const clearUser = useUserStore((s) => s.clearUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser()
      navigate({ to: ROUTES.login })
    },
    onError: () => {
      // Clear locally even if server call fails
      clearUser()
      navigate({ to: ROUTES.login })
    },
  })
}
