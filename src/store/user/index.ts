import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AdminUser } from "@/types/auth"
import { clearAuthCookie } from "@/lib/auth-cookie"

interface UserStore {
  user: AdminUser | null
  permissions: string[]
  isAuthenticated: boolean
  setUser: (user: AdminUser, permissions: string[]) => void
  clearUser: () => void
  hasPermission: (permission: string) => boolean
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      isAuthenticated: false,

      setUser: (user, permissions) => set({ user, permissions, isAuthenticated: true }),

      clearUser: () => {
        clearAuthCookie()
        set({ user: null, permissions: [], isAuthenticated: false })
      },

      hasPermission: (permission) => get().permissions.includes(permission),
    }),
    {
      name: "ebuy-admin-user",
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
