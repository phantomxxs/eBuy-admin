import instance from "@/services/axios-instance"
import {
  SETTINGS_BRAND_BUSINESS,
  SETTINGS_ORDER_MANAGEMENT,
  SETTINGS_PAYMENTS_FINANCE,
  SETTINGS_SECURITY_ACCESS,
  SETTINGS_CHANGE_PASSWORD,
  SETTINGS_NOTIFICATION_PREFERENCES,
} from "@/services/apis"
import type {
  BrandBusinessSettings,
  OrderManagementSettings,
  PaymentsFinanceSettings,
  SecurityAccessSettings,
  NotificationPreferencesSettings,
  UpdateBrandBusinessPayload,
  UpdateOrderManagementPayload,
  UpdatePaymentsFinancePayload,
  UpdateSecurityAccessPayload,
  ChangePasswordPayload,
  UpdateNotificationPreferencesPayload,
} from "@/types/settings"
import type {} from "@/types/utils"

export const getBrandBusiness = async (): Promise<BrandBusinessSettings> => {
  const response = await instance.get(SETTINGS_BRAND_BUSINESS)
  return response.data
}

export const updateBrandBusiness = async (
  payload: UpdateBrandBusinessPayload,
): Promise<BrandBusinessSettings> => {
  const response = await instance.put(SETTINGS_BRAND_BUSINESS, payload)
  return response.data
}

export const getOrderManagement = async (): Promise<OrderManagementSettings> => {
  const response = await instance.get(SETTINGS_ORDER_MANAGEMENT)
  return response.data
}

export const updateOrderManagement = async (
  payload: UpdateOrderManagementPayload,
): Promise<OrderManagementSettings> => {
  const response = await instance.put(SETTINGS_ORDER_MANAGEMENT, payload)
  return response.data
}

export const getPaymentsFinance = async (): Promise<PaymentsFinanceSettings> => {
  const response = await instance.get(SETTINGS_PAYMENTS_FINANCE)
  return response.data
}

export const updatePaymentsFinance = async (
  payload: UpdatePaymentsFinancePayload,
): Promise<PaymentsFinanceSettings> => {
  const response = await instance.put(SETTINGS_PAYMENTS_FINANCE, payload)
  return response.data
}

export const getSecurityAccess = async (): Promise<SecurityAccessSettings> => {
  const response = await instance.get(SETTINGS_SECURITY_ACCESS)
  return response.data
}

export const updateSecurityAccess = async (
  payload: UpdateSecurityAccessPayload,
): Promise<SecurityAccessSettings> => {
  const response = await instance.put(SETTINGS_SECURITY_ACCESS, payload)
  return response.data
}

export const changePassword = async (payload: ChangePasswordPayload): Promise<null> => {
  const response = await instance.post(SETTINGS_CHANGE_PASSWORD, payload)
  return response.data
}

export const getNotificationPreferences = async (): Promise<NotificationPreferencesSettings> => {
  const response = await instance.get(SETTINGS_NOTIFICATION_PREFERENCES)
  return response.data
}

export const updateNotificationPreferences = async (
  payload: UpdateNotificationPreferencesPayload,
): Promise<NotificationPreferencesSettings> => {
  const response = await instance.put(SETTINGS_NOTIFICATION_PREFERENCES, payload)
  return response.data
}
