import { create } from "zustand"
import type { AdminUser } from "@/types/auth"
import { getAuthCookie, setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie"

interface AuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (token: string, user: AdminUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getAuthCookie(),
  isAuthenticated: !!getAuthCookie(),

  setAuth: (token, user) => {
    setAuthCookie(token)
    set({ token, user, isAuthenticated: true })
  },

  clearAuth: () => {
    clearAuthCookie()
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
