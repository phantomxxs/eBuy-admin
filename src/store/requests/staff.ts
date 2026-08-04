import instance from "@/services/axios-instance"
import {
  USERS,
  USER_METRICS,
  USER_BY_ID,
  USER_CHANGE_ROLE,
  USER_REACTIVATE,
  INVITES,
  INVITE_BY_ID,
  INVITE_SEND,
  INVITE_RESEND,
  INVITE_VALIDATE,
  INVITE_ACCEPT,
  ROLES,
  ROLE_BY_ID,
  ROLES_BULK_PERMISSIONS,
  PERMISSIONS,
  ACTIVITY_LOGS,
} from "@/services/apis"
import type {
  Staff,
  AppUser,
  StaffMetrics,
  Role,
  PermissionGroup,
  UserActivityLogPage,
  CreateStaffPayload,
  UpdateStaffPayload,
  ChangeStaffRolePayload,
  CreateInvitePayload,
  AcceptInvitePayload,
  ValidateInviteTokenResponse,
  CreateRolePayload,
  UpdateRolePayload,
  BulkPermissionsPayload,
} from "@/types/staff"
import type { PaginatedApiResponse, PaginatedQueryParams } from "@/types/utils"
import { normalizeStaff } from "@/store/normalizers/staff"

export const getStaff = async (params: PaginatedQueryParams): PaginatedApiResponse<AppUser> => {
  const response = await instance.get(USERS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    },
  })
  const raw = response.data
  return { ...raw, items: (raw.items as Staff[]).map(normalizeStaff) }
}

export const getStaffById = async (id: string): Promise<AppUser> => {
  const response = await instance.get(USER_BY_ID(id))
  return normalizeStaff(response.data as Staff)
}

export const getStaffMetrics = async (): Promise<StaffMetrics> => {
  const response = await instance.get(USER_METRICS)
  return response.data
}

export const createStaff = async (payload: CreateStaffPayload): Promise<Staff> => {
  const response = await instance.post(USERS, payload)
  return response.data
}

export const updateStaff = async (id: string, payload: UpdateStaffPayload): Promise<Staff> => {
  const response = await instance.put(USER_BY_ID(id), payload)
  return response.data
}

export const changeStaffRole = async (
  id: string,
  payload: ChangeStaffRolePayload,
): Promise<Staff> => {
  const response = await instance.put(USER_CHANGE_ROLE(id), payload)
  return response.data
}

export const deactivateStaff = async (id: string): Promise<null> => {
  const response = await instance.delete(USER_BY_ID(id))
  return response.data
}

export const reactivateStaff = async (id: string): Promise<Staff> => {
  const response = await instance.put(USER_REACTIVATE(id))
  return response.data
}

export const getInvites = async (): Promise<Staff[]> => {
  const response = await instance.get(INVITES)
  return response.data
}

export const createInvite = async (payload: CreateInvitePayload): Promise<Staff> => {
  const response = await instance.post(INVITES, payload)
  return response.data
}

export const sendInvite = async (id: string): Promise<null> => {
  const response = await instance.put(INVITE_SEND(id))
  return response.data
}

export const resendInvite = async (id: string): Promise<null> => {
  const response = await instance.put(INVITE_RESEND(id))
  return response.data
}

export const cancelInvite = async (id: string): Promise<null> => {
  const response = await instance.delete(INVITE_BY_ID(id))
  return response.data
}

export const validateInviteToken = async (token: string): Promise<ValidateInviteTokenResponse> => {
  const response = await instance.get(INVITE_VALIDATE(token))
  return response.data
}

export const acceptInvite = async (payload: AcceptInvitePayload): Promise<null> => {
  const response = await instance.post(INVITE_ACCEPT, payload)
  return response.data
}

export const getRoles = async (): Promise<Role[]> => {
  const response = await instance.get(ROLES)
  return response.data
}

export const getRoleById = async (id: number): Promise<Role> => {
  const response = await instance.get(ROLE_BY_ID(String(id)))
  return response.data
}

export const createRole = async (payload: CreateRolePayload): Promise<Role> => {
  const response = await instance.post(ROLES, payload)
  return response.data
}

export const updateRole = async (id: number, payload: UpdateRolePayload): Promise<Role> => {
  const response = await instance.put(ROLE_BY_ID(String(id)), payload)
  return response.data
}

export const deleteRole = async (id: number): Promise<null> => {
  const response = await instance.delete(ROLE_BY_ID(String(id)))
  return response.data
}

export const bulkUpdateRolePermissions = async (payload: BulkPermissionsPayload): Promise<null> => {
  const response = await instance.put(ROLES_BULK_PERMISSIONS, payload)
  return response.data
}

export const getStaffLogs = async (page = 1, pageSize = 20): Promise<UserActivityLogPage> => {
  const response = await instance.get(ACTIVITY_LOGS, { params: { page, page_size: pageSize } })
  return response.data
}

export const getPermissions = async (): Promise<PermissionGroup[]> => {
  const response = await instance.get(PERMISSIONS)
  return response.data
}
