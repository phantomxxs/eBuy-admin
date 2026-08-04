import instance from "@/services/axios-instance"
import {
  LOGIN,
  AUTH_ME,
  AUTH_LOGOUT,
  PASSWORD_RESET_REQUEST,
  PASSWORD_RESET_VALIDATE,
  PASSWORD_RESET_CONFIRM,
} from "@/services/apis"
import type { LoginCredentials, LoginResponse } from "@/types/auth"

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await instance.post(LOGIN, credentials)
  return response.data
}

export const getMe = async (): Promise<Omit<LoginResponse, "token">> => {
  const response = await instance.get(AUTH_ME)
  const raw = response.data
  // API returns a flat object — split out permissions from the user fields
  const { permissions, ...userFields } = raw
  return { user: userFields, permissions: permissions ?? [] }
}

export const logout = async (): Promise<void> => {
  await instance.post(AUTH_LOGOUT)
}

export const requestPasswordReset = async (email: string): Promise<void> => {
  await instance.post(PASSWORD_RESET_REQUEST, { email })
}

export const validatePasswordResetToken = async (token: string): Promise<void> => {
  await instance.get(PASSWORD_RESET_VALIDATE(token))
}

export const confirmPasswordReset = async (payload: {
  token: string
  password: string
  confirmPassword: string
}): Promise<void> => {
  await instance.post(PASSWORD_RESET_CONFIRM, payload)
}
