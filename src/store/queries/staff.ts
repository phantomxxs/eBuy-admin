import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  getStaff,
  getStaffMetrics,
  getInvites,
  getRoles,
  getRoleById,
  getStaffLogs,
  getPermissions,
  getStaffById,
} from "../requests/staff"
import {
  GET_STAFF_KEY,
  GET_STAFF_METRICS_KEY,
  GET_INVITES_KEY,
  GET_ROLES_KEY,
  GET_ROLE_BY_ID_KEY,
  GET_STAFF_LOGS_KEY,
  GET_PERMISSIONS_KEY,
  GET_STAFF_BY_ID_KEY,
} from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { PaginatedQueryParams } from "@/types/utils"

export const useGetStaffById = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.STAFF_VIEW))
  return useQuery({
    queryKey: [GET_STAFF_BY_ID_KEY, id],
    queryFn: () => getStaffById(id!),
    enabled: id !== null && canView,
  })
}

export const useGetStaff = (params: PaginatedQueryParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.STAFF_VIEW))
  return useQuery({
    queryKey: [GET_STAFF_KEY, params],
    queryFn: () => getStaff(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetStaffMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.STAFF_VIEW))
  return useQuery({
    queryKey: [GET_STAFF_METRICS_KEY],
    queryFn: getStaffMetrics,
    enabled: canView,
  })
}

export const useGetInvites = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.STAFF_VIEW))
  return useQuery({
    queryKey: [GET_INVITES_KEY],
    queryFn: getInvites,
    enabled: canView,
  })
}

export const useGetRoles = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.ROLES_VIEW))
  return useQuery({
    queryKey: [GET_ROLES_KEY],
    queryFn: getRoles,
    enabled: canView,
  })
}

export const useGetRoleOptions = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.ROLES_VIEW))
  const { data, ...rest } = useQuery({
    queryKey: [GET_ROLES_KEY],
    queryFn: getRoles,
    enabled: canView,
  })
  return {
    ...rest,
    data: (data ?? []).map((r) => ({ label: r.name, value: String(r.role_id) })),
  }
}

export const useGetRoleById = (id: number | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.ROLES_VIEW))
  return useQuery({
    queryKey: [GET_ROLE_BY_ID_KEY, id],
    queryFn: () => getRoleById(id!),
    enabled: id !== null && canView,
  })
}

export const useGetStaffLogs = (page = 1, pageSize = 20) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.STAFF_VIEW))
  return useQuery({
    queryKey: [GET_STAFF_LOGS_KEY, page, pageSize],
    queryFn: () => getStaffLogs(page, pageSize),
    enabled: canView,
  })
}

export const useGetPermissions = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.ROLES_MANAGE))
  return useQuery({
    queryKey: [GET_PERMISSIONS_KEY],
    queryFn: getPermissions,
    enabled: canView,
  })
}

export const useStaffSearch = (params: PaginatedQueryParams) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.STAFF_VIEW))
  return useQuery({
    queryKey: [GET_STAFF_KEY, params],
    queryFn: () => getStaff(params),
    select: (res) => res.items.map((s) => ({ label: s.name, value: s.id })),
    enabled: canView,
  })
}
