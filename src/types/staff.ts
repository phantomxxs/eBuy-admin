import type { PaginatedQueryParams } from "./utils"

export type UserRole = "Super Admin" | "Admin" | "Store Manager" | "Support" | "Analyst"
export type UserStatus = "active" | "inactive" | "pending" | "invited" | "draft"

// Role interface
// Enums
export enum StaffStatus {
  ACTIVE = "active",
  DRAFT = "draft",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum StoreAccess {
  ALL = "all",
  SELECTED = "selected",
}

// Role interface
export interface StaffRole {
  role_id: number
  name: string
}

// Normalized flat user shape consumed by UI components
export interface AppUser {
  id: string
  name: string
  email: string
  initials: string
  role: string
  storeAccess: string
  dateAdded: string
  status: UserStatus
  inviteId?: string
}

// Staff interface
export interface Staff {
  user_id: number
  firstname: string
  lastname: string
  email: string
  role: StaffRole
  store_access: StoreAccess
  store_access_labels: string[]
  date_added: string
  status: StaffStatus
  invite_id: number
}

// Staff Details interface
export interface StaffDetails extends Staff {}

export interface StaffMetrics {
  total_users: number
  active_users: number
  inactive_users: number
  pending_users: number
}

export interface Role {
  role_id: number
  name: string
  description: string
  permissions: string[]
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface CreateStaffPayload {
  firstname: string
  lastname: string
  email: string
  password: string
  roleId: number
  storeAccess: string | number[]
}

export interface UpdateStaffPayload {
  firstname?: string
  lastname?: string
  email?: string
}

export interface ChangeStaffRolePayload {
  roleId: number
  storeAccess: string | number[]
  reason?: string
}

export interface CreateInvitePayload {
  firstname: string
  lastname: string
  email: string
  roleId: number
  storeAccess: string | string[]
  send: boolean
}

export interface AcceptInvitePayload {
  token: string
  password: string
}

export interface ValidateInviteTokenResponse {
  valid: boolean
  email: string
  firstname: string
  lastname: string
  role: string
}

export interface CreateRolePayload {
  name: string
  description: string
  permissions: string[]
}

export interface UpdateRolePayload {
  name?: string
  description?: string
  permissions?: string[]
}

export interface BulkPermissionsPayload {
  rolePermissions: Array<{
    role_id: number
    permissions: string[]
  }>
}

export interface Permission {
  key: string
  label: string
}

export interface PermissionGroup {
  key: string
  label: string
  permissions: Permission[]
}

export interface UserActivityLog {
  log_id: number
  date: string
  activity: string
  action: string
  by: string
  user_id?: number
  target_type: string
  target_id: number
  ip_address: string
}

export interface UserActivityLogPage {
  items: UserActivityLog[]
  total_count: number
  page_size: number
  current_page: number
}
