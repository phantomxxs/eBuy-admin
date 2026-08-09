import axios from "axios"
import { clearAuthCookie, getAuthCookie } from "@/lib/auth-cookie"
import { showAlert } from "@/store/alerts"
import { useUserStore } from "@/store/user"

const instance = axios.create({
  baseURL: import.meta.env.VITE_EBUY_BASE_URL ?? "",
  headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
})

instance.interceptors.request.use((config) => {
  const token = getAuthCookie()
  if (token) {
    config.headers["X-Admin-Token"] = token
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    // 401 Unauthorized — token invalid or expired, clear session and redirect to login.
    // Skip auth endpoints: a 401 there means invalid credentials / reset token, not an
    // expired session, and the calling page handles the error itself.
    const isAuthRequest = (error?.config?.url ?? "").startsWith("/auth/")
    if (status === 401 && !isAuthRequest) {
      useUserStore.getState().clearUser()
      clearAuthCookie()
      window.location.replace("/login")
    }

    // 403 Forbidden — authenticated but lacks permission; show alert, do NOT logout
    if (status === 403) {
      showAlert({
        variant: "error",
        title: "Access denied",
        message:
          error?.response?.data?.message ?? "You do not have permission to perform this action.",
      })
    }

    let message: string =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong"
    const params: unknown[] = error?.response?.data?.parameters ?? []
    if (params.length) {
      params.forEach((p, i) => {
        message = message.replace(`%${i + 1}`, String(p))
      })
    }
    return Promise.reject(new Error(message))
  },
)

export default instance
