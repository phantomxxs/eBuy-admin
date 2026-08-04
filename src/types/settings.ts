// ─── Brand & Business ─────────────────────────────────────────────────────────
export interface BrandBusinessSettings {
  brand_name: string
  business_email: string
  support_email: string
  store_phone: string
  website_url: string
  currency_code: string
  rc_number: string
  tin: string
  country_id: string
  state_id: number | null
  lga_id: number | null
  registered_head_office: string
  store_description: string
}

export interface UpdateBrandBusinessPayload {
  brand_name?: string
  business_email?: string
  support_email?: string
  store_phone?: string
  website_url?: string
  currency_code?: string
  rc_number?: string
  tin?: string
  country_id?: string
  state_id?: number | null
  lga_id?: number | null
  registered_head_office?: string
  store_description?: string
}

// ─── Order Management ─────────────────────────────────────────────────────────
export interface OrderManagementSettings {
  require_cancellation_reason: boolean
  customer_self_cancel_enabled: boolean
  customer_self_cancel_window_minutes: number
  auto_refund_on_cancellation_mode: string
  new_order_email_to_customer: boolean
  dispatch_notification_to_customer: boolean
  order_prefix: string
  order_number_start: number
}

export interface UpdateOrderManagementPayload {
  require_cancellation_reason?: boolean
  customer_self_cancel_enabled?: boolean
  customer_self_cancel_window_minutes?: number
  auto_refund_on_cancellation_mode?: string
  new_order_email_to_customer?: boolean
  dispatch_notification_to_customer?: boolean
  order_prefix?: string
  order_number_start?: number
}

// ─── Payments & Finance ───────────────────────────────────────────────────────
export interface PaymentsFinanceSettings {
  tax_enabled: boolean
  prices_include_tax: boolean
  vat_rate: number
  show_tax_breakdown_on_receipt: boolean
  refund_window_days: number
  refund_method: string
}

export interface UpdatePaymentsFinancePayload {
  tax_enabled?: boolean
  prices_include_tax?: boolean
  vat_rate?: number
  show_tax_breakdown_on_receipt?: boolean
  refund_window_days?: number
  refund_method?: string
}

// ─── Security & Access ────────────────────────────────────────────────────────
export interface SecurityAccessSettings {
  notify_login_from_new_device: boolean
}

export interface UpdateSecurityAccessPayload {
  notify_login_from_new_device?: boolean
}

// ─── Change Password ──────────────────────────────────────────────────────────
export interface ChangePasswordPayload {
  old_password: string
  new_password: string
}

// ─── Notification Preferences ─────────────────────────────────────────────────
export interface NotificationChannels {
  email: boolean
  sms: boolean
  push: boolean
  in_app: boolean
}

export interface NotificationPreferenceItem {
  event_code: string
  label: string
  channels: NotificationChannels
}

export interface NotificationPreferenceGroup {
  code: string
  label: string
  items: NotificationPreferenceItem[]
}

export interface NotificationPreferencesSettings {
  groups: NotificationPreferenceGroup[]
}

export interface UpdateNotificationPreferencesPayload {
  request: {
    items: Array<{
      event_code: string
      channels: NotificationChannels
    }>
  }
}
