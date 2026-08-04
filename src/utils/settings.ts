export const SETTINGS_SECTION = {
  BRAND_BUSINESS: "brand",
  // LOCATION: "location",
  ORDER_MANAGEMENT: "orders",
  PAYMENTS_FINANCE: "payments",
  NOTIFICATIONS: "notifications",
  SECURITY: "security",
} as const

export type SettingsSectionId = (typeof SETTINGS_SECTION)[keyof typeof SETTINGS_SECTION]
