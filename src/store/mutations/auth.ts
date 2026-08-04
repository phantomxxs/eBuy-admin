import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  login,
  logout,
  requestPasswordReset,
  validatePasswordResetToken,
  confirmPasswordReset,
} from "@/store/requests/auth"
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
    },
  })
}

export const useRequestPasswordReset = () => useMutation({ mutationFn: requestPasswordReset })

export const useValidatePasswordResetToken = () =>
  useMutation({ mutationFn: validatePasswordResetToken })

export const useConfirmPasswordReset = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: () => navigate({ to: ROUTES.login }),
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
