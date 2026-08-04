/**
 * All permission key strings as returned by the /auth/me endpoint.
 * Format: "<module>:<action>" (colon-separated, underscored actions)
 */
export const PERMISSIONS = {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD_VIEW_METRICS: "dashboard:view_metrics",
  DASHBOARD_VIEW_REVENUE: "dashboard:view_revenue",
  DASHBOARD_VIEW_LOW_STOCK: "dashboard:view_low_stock",
  DASHBOARD_EXPORT_REPORTS: "dashboard:export_reports",

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS_VIEW: "notifications:view",

  // ── Commerce: Orders ──────────────────────────────────────────────────────
  ORDERS_VIEW: "orders:view",
  ORDERS_ACCEPT: "orders:accept",
  ORDERS_REJECT_CANCEL: "orders:reject_cancel",
  ORDERS_REFUND: "orders:refund",
  ORDERS_EXPORT: "orders:export",

  // ── Catalog: Products ─────────────────────────────────────────────────────
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_EDIT: "products:edit",
  PRODUCTS_BULK_UPLOAD: "products:bulk_upload",
  PRODUCTS_DELETE: "products:delete",

  // ── Commerce: Reviews ─────────────────────────────────────────────────────
  REVIEWS_VIEW: "reviews:view",
  REVIEWS_MODERATE: "reviews:moderate",
  REVIEWS_DELETE: "reviews:delete",
  REVIEWS_EXPORT: "reviews:export",

  // ── Commerce: Customers ───────────────────────────────────────────────────
  CUSTOMERS_VIEW_LIST: "customers:view_list",
  CUSTOMERS_CREATE: "customers:create",
  CUSTOMERS_VIEW_DETAILS: "customers:view_details",
  CUSTOMERS_EXPORT: "customers:export",
  CUSTOMERS_ADD_NOTES: "customers:add_notes",

  // ── Marketing: Promotions (Discounts in UI) ───────────────────────────────
  PROMOTIONS_VIEW: "promotions:view",
  PROMOTIONS_CREATE: "promotions:create",
  PROMOTIONS_ACTIVATE: "promotions:activate",
  PROMOTIONS_DELETE: "promotions:delete",

  // ── Operations: Transactions ──────────────────────────────────────────────
  TRANSACTIONS_VIEW: "transactions:view",
  TRANSACTIONS_EXPORT: "transactions:export",
  TRANSACTIONS_REFUND: "transactions:refund",

  // ── Operations: Locations ─────────────────────────────────────────────────
  LOCATIONS_VIEW: "locations:view",
  LOCATIONS_MANAGE: "locations:manage",
  LOCATIONS_EXPORT: "locations:export",

  // ── Operations: Inventory ─────────────────────────────────────────────────
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_ADJUST: "inventory:adjust",
  INVENTORY_IMPORT: "inventory:import",
  INVENTORY_EXPORT: "inventory:export",

  // ── Operations: Banners ───────────────────────────────────────────────────
  BANNERS_VIEW: "banners:view",
  BANNERS_MANAGE: "banners:manage",

  // ── Admin: Staff & Roles ──────────────────────────────────────────────────
  STAFF_VIEW: "staff:view",
  STAFF_MANAGE: "staff:manage",
  ROLES_VIEW: "roles:view",
  ROLES_MANAGE: "roles:manage",

  // ── Admin: Analytics ──────────────────────────────────────────────────────
  ANALYTICS_VIEW: "analytics:view",
  ANALYTICS_EXPORT: "analytics:export",

  // ── Admin: Settings ───────────────────────────────────────────────────────
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",

  // ── Integrations / Marketplace ────────────────────────────────────────────
  INTEGRATIONS_VIEW: "integrations:view",
  INTEGRATIONS_MANAGE: "integrations:manage",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Maps each app route to the single permission required to see it in the sidebar.
 * Routes absent from this map are visible to all authenticated users.
 *
 * Sidebar items use these for conditional rendering.
 * Route-level guards can also reference this map.
 */
export const MODULE_PERMISSIONS: Partial<Record<string, Permission>> = {
  "/dashboard": PERMISSIONS.DASHBOARD_VIEW_METRICS,

  "/products": PERMISSIONS.PRODUCTS_VIEW,
  "/products/bulk-upload": PERMISSIONS.PRODUCTS_BULK_UPLOAD,

  "/orders": PERMISSIONS.ORDERS_VIEW,
  "/customers": PERMISSIONS.CUSTOMERS_VIEW_LIST,
  "/discounts": PERMISSIONS.PROMOTIONS_VIEW,
  "/reviews": PERMISSIONS.REVIEWS_VIEW,

  "/transactions": PERMISSIONS.TRANSACTIONS_VIEW,
  "/locations": PERMISSIONS.LOCATIONS_VIEW,
  "/inventory": PERMISSIONS.INVENTORY_VIEW,
  "/banners": PERMISSIONS.BANNERS_VIEW,

  "/staff": PERMISSIONS.STAFF_VIEW,
  "/analytics": PERMISSIONS.ANALYTICS_VIEW,
  "/settings": PERMISSIONS.SETTINGS_VIEW,

  "/marketplace": PERMISSIONS.INTEGRATIONS_VIEW,

  // No API permission for these yet — shown to all authenticated users:
  // /categories, /gift-cards, /vouchers, /blogs, /messaging, /logs
}
