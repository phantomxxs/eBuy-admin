import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateBrandBusiness,
  updateOrderManagement,
  updatePaymentsFinance,
  updateSecurityAccess,
  changePassword,
  updateNotificationPreferences,
} from "../requests/settings"
import {
  GET_SETTINGS_BRAND_BUSINESS_KEY,
  GET_SETTINGS_ORDER_MANAGEMENT_KEY,
  GET_SETTINGS_PAYMENTS_FINANCE_KEY,
  GET_SETTINGS_SECURITY_ACCESS_KEY,
  GET_SETTINGS_NOTIFICATION_PREFERENCES_KEY,
} from "../query-keys"
import type {
  UpdateBrandBusinessPayload,
  UpdateOrderManagementPayload,
  UpdatePaymentsFinancePayload,
  UpdateSecurityAccessPayload,
  ChangePasswordPayload,
  UpdateNotificationPreferencesPayload,
} from "@/types/settings"

export const useUpdateBrandBusiness = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateBrandBusinessPayload) => updateBrandBusiness(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_SETTINGS_BRAND_BUSINESS_KEY] }),
  })
}

export const useUpdateOrderManagement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateOrderManagementPayload) => updateOrderManagement(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_SETTINGS_ORDER_MANAGEMENT_KEY] }),
  })
}

export const useUpdatePaymentsFinance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePaymentsFinancePayload) => updatePaymentsFinance(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_SETTINGS_PAYMENTS_FINANCE_KEY] }),
  })
}

export const useUpdateSecurityAccess = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSecurityAccessPayload) => updateSecurityAccess(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_SETTINGS_SECURITY_ACCESS_KEY] }),
  })
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  })

export const useUpdateNotificationPreferences = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateNotificationPreferencesPayload) =>
      updateNotificationPreferences(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [GET_SETTINGS_NOTIFICATION_PREFERENCES_KEY] }),
  })
}
