import { useQuery } from "@tanstack/react-query"
import {
  getBrandBusiness,
  getOrderManagement,
  getPaymentsFinance,
  getSecurityAccess,
  getNotificationPreferences,
} from "../requests/settings"
import {
  GET_SETTINGS_BRAND_BUSINESS_KEY,
  GET_SETTINGS_ORDER_MANAGEMENT_KEY,
  GET_SETTINGS_PAYMENTS_FINANCE_KEY,
  GET_SETTINGS_SECURITY_ACCESS_KEY,
  GET_SETTINGS_NOTIFICATION_PREFERENCES_KEY,
} from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"

export const useGetBrandBusiness = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.SETTINGS_VIEW))
  return useQuery({
    queryKey: [GET_SETTINGS_BRAND_BUSINESS_KEY],
    queryFn: getBrandBusiness,
    enabled: canView,
  })
}

export const useGetOrderManagement = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.SETTINGS_VIEW))
  return useQuery({
    queryKey: [GET_SETTINGS_ORDER_MANAGEMENT_KEY],
    queryFn: getOrderManagement,
    enabled: canView,
  })
}

export const useGetPaymentsFinance = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.SETTINGS_VIEW))
  return useQuery({
    queryKey: [GET_SETTINGS_PAYMENTS_FINANCE_KEY],
    queryFn: getPaymentsFinance,
    enabled: canView,
  })
}

export const useGetSecurityAccess = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.SETTINGS_VIEW))
  return useQuery({
    queryKey: [GET_SETTINGS_SECURITY_ACCESS_KEY],
    queryFn: getSecurityAccess,
    enabled: canView,
  })
}

export const useGetNotificationPreferences = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.SETTINGS_VIEW))
  return useQuery({
    queryKey: [GET_SETTINGS_NOTIFICATION_PREFERENCES_KEY],
    queryFn: getNotificationPreferences,
    enabled: canView,
  })
}
