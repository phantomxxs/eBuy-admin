export interface AdminRole {
  role_id: number
  name: string
}

export interface AdminUser {
  user_id: number
  firstname: string
  lastname: string
  email: string
  role: AdminRole
  store_access: string | number[]
  is_active: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AdminUser
  permissions: string[]
}
