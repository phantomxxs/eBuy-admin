export const INVENTORY_TAB = {
  BY_PRODUCT: "By product",
  BY_LOCATION: "By location",
  TRANSFERS: "Transfers",
  ACTIVITY_LOGS: "Activity logs",
} as const

export type InventoryTab = (typeof INVENTORY_TAB)[keyof typeof INVENTORY_TAB]
