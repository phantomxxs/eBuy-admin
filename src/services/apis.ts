// Base for product-image endpoints — these sit at /api/adminportal/ (no hyphen),
// not under the standard /api/admin-portal/ base used by the axios instance.
const _imageApiBase = (import.meta.env.VITE_EBUY_BASE_URL ?? "").replace(/\/admin-portal$/, "")

// Base for geo endpoints — these sit at /api/geo/, not under /api/admin-portal/.
const _geoApiBase = (import.meta.env.VITE_EBUY_BASE_URL ?? "").replace(/\/admin-portal$/, "")

// ─── Admin Portal ─────────────────────────────────────────────────────────────
export const LOGIN = "/auth/login"
export const AUTH_ME = "/auth/me"
export const AUTH_LOGOUT = "/auth/logout"
export const PASSWORD_RESET_REQUEST = "/auth/password-reset/request"
export const PASSWORD_RESET_VALIDATE = (token: string) => `/auth/password-reset/validate/${token}`
export const PASSWORD_RESET_CONFIRM = "/auth/password-reset/confirm"

export const USERS = "/staff"
export const USER_METRICS = "/staff/stats"
export const USER_BY_ID = (id: string) => `${USERS}/${id}`
export const USER_CHANGE_ROLE = (id: string) => `${USERS}/${id}/change-role`
export const USER_REACTIVATE = (id: string) => `${USERS}/${id}/reactivate`

export const INVITES = "/invites"
export const INVITE_BY_ID = (id: string) => `${INVITES}/${id}`
export const INVITE_SEND = (id: string) => `${INVITES}/${id}/send`
export const INVITE_RESEND = (id: string) => `${INVITES}/${id}/resend`
export const INVITE_VALIDATE = (token: string) => `${INVITES}/validate/${token}`
export const INVITE_ACCEPT = `${INVITES}/accept`

export const ROLES = "/roles"
export const ROLE_BY_ID = (id: string) => `${ROLES}/${id}`
export const ROLES_BULK_PERMISSIONS = "/roles/bulk-permissions"
export const PERMISSIONS = "/permissions"

export const ACTIVITY_LOGS = "/activity-logs"
export const ACTIVITY_LOGS_EXPORT = "/activity-logs/export"

export const DASHBOARD_STATS = "/dashboard/stats"
export const DASHBOARD_REVENUE_CHART = "/dashboard/revenue-chart"
export const DASHBOARD_LOW_STOCK = "/dashboard/low-stock"
export const DASHBOARD_PENDING_ORDERS = "/dashboard/pending-orders"

export const PRODUCTS = "/products"
export const PRODUCT_MASTER_CATALOG = "/products/master-catalog"
export const PRODUCT_MASTER_CATALOG_BY_ID = (id: number) => `/products/master-catalog/${id}`
export const PRODUCT_MASTER_CATALOG_IMPORT = "/products/master-catalog/import"
export const PRODUCT_METRICS = "/products/stats"
export const PRODUCT_BULK_UPLOAD = "/products/bulk-upload"
export const PRODUCT_BULK_UPLOAD_TEMPLATE = "/products/bulk-upload/template"
export const PRODUCT_QUEUED_BULK_UPLOAD_TARGET = "/products/queued-bulk-uploads/upload-target"
export const PRODUCT_QUEUED_BULK_UPLOADS = "/products/queued-bulk-uploads"
export const BULK_UPLOADS = "/bulk-uploads"
export const BULK_UPLOAD_BY_ID = (jobId: string) => `${BULK_UPLOADS}/${jobId}`
export const BULK_UPLOAD_ITEMS = (jobId: string) => `${BULK_UPLOADS}/${jobId}/items`
export const PRODUCT_EXPORT_CSV = "/products/export"
export const PRODUCT_BY_ID = (id: string) => `${PRODUCTS}/${id}`
export const PRODUCT_STATUS = (id: string) => `${PRODUCTS}/${id}/status`
export const PRODUCT_INVENTORY_URL = (id: string) => `${PRODUCTS}/${id}/inventory`
export const PRODUCT_ACTIVITY_LOGS_URL = (id: string) => `${PRODUCTS}/${id}/activity-log`
export const PRODUCT_CREATE_WITH_IMAGES = `${_imageApiBase}/adminportal/product/createwithimages`
export const PRODUCT_UPDATE_WITH_IMAGES = `${_imageApiBase}/adminportal/product/updatewithimages`
export const PRODUCT_ADD_IMAGES = `${_imageApiBase}/adminportal/product/addimages`
export const PRODUCT_REMOVE_IMAGE = `${_imageApiBase}/adminportal/product/removeimage`

export const CATEGORY_CREATE_WITH_IMAGE = `${_imageApiBase}/adminportal/category/createwithimage`
export const CATEGORY_UPDATE_WITH_IMAGE = `${_imageApiBase}/adminportal/category/updatewithimage`

export const CATEGORIES = "/categories"
export const CATEGORY_METRICS = "/categories/stats"
export const CATEGORY_DROPDOWN = "/categories/dropdown"
export const CATEGORY_EXPORT = "/categories/export"
export const CATEGORY_BY_ID = (id: string) => `${CATEGORIES}/${id}`
export const CATEGORY_STATUS = (id: string) => `${CATEGORIES}/${id}/status`

export const ORDERS = "/orders"
export const ORDER_METRICS = "/orders/stats"
export const ORDER_EXPORT = "/orders/export"
export const BANKS = "/banks"
export const ORDER_BY_ID = (id: string) => `${ORDERS}/${id}`
export const ORDER_ACCEPT = (id: string) => `${ORDERS}/${id}/accept`
export const ORDER_CANCEL = (id: string) => `${ORDERS}/${id}/cancel`
export const ORDER_REFUND = (id: string) => `${ORDERS}/${id}/refund`
export const ORDER_FULFILLMENT = (id: string) => `${ORDERS}/${id}/fulfillment`
export const ORDER_TRANSFER = (id: string) => `${ORDERS}/${id}/transfer`
export const ORDER_RECEIPT = (id: string) => `${ORDERS}/${id}/receipt`
export const ORDER_WALK_IN = `${ORDERS}/walk-in`

export const TRANSACTIONS = "/transactions"
export const TRANSACTION_METRICS = "/transactions/stats"
export const TRANSACTION_EXPORT = "/transactions/export"
export const TRANSACTION_BY_ID = (id: string) => `${TRANSACTIONS}/${id}`
export const TRANSACTION_RECEIPT = (ref: string) => `${TRANSACTIONS}/${ref}/receipt`

// ─── Store ────────────────────────────────────────────────────────────────────
export const LOCATIONS = "/locations"
export const LOCATION_EXPORT = "/locations/export"
export const LOCATION_BY_ID = (id: string) => `${LOCATIONS}/${id}`
export const LOCATION_VALIDATE_SHIPBUBBLE = (id: string) =>
  `${LOCATIONS}/${id}/validate-shipbubble-address`
// Location tab sub-lists reuse the generic list endpoints with filter params — no dedicated sub-routes

export const INVENTORY = "/inventory"
export const INVENTORY_METRICS = `${INVENTORY}/stats`
export const INVENTORY_SAVE = `${INVENTORY}/save`
export const INVENTORY_BULK = `${INVENTORY}/bulk`
export const INVENTORY_ADJUST = `${INVENTORY}/adjust`
export const INVENTORY_IMPORT = `${INVENTORY}/import`
export const INVENTORY_EXPORT = `${INVENTORY}/export`
export const INVENTORY_ACTIVITY = `${INVENTORY}/activity-logs`
export const INVENTORY_TRANSFERS = `${INVENTORY}/transfers`
export const INVENTORY_TRANSFER_BY_ID = (id: string) => `${INVENTORY}/transfers/${id}`
export const INVENTORY_TRANSFER_COMPLETE = (id: string) => `${INVENTORY}/transfers/${id}/complete`
export const INVENTORY_TRANSFER_CANCEL = (id: string) => `${INVENTORY}/transfers/${id}/cancel`
export const INVENTORY_LOCATION_DETAIL = (id: string) => `${INVENTORY}/locations/${id}`
export const INVENTORY_BY_ID = (id: string) => `${INVENTORY}/${id}`
export const INVENTORY_ADJUSTMENTS = "/store-inventory/adjustments"

export const BANNERS = "/banners"
export const BANNER_BY_ID = (id: string) => `${BANNERS}/${id}`
export const BANNER_STATUS = (id: string) => `${BANNERS}/${id}/status`
export const BANNER_EXPORT = `${BANNERS}/export`
export const BANNER_METRICS = `${BANNERS}/stats`
export const BANNER_CREATE_WITH_IMAGE = `${_imageApiBase}/adminportal/banner/createwithimage`

export const CUSTOMERS = "/customers"
export const CUSTOMER_METRICS = "/customers/stats"
export const CUSTOMER_EXPORT = "/customers/export"
export const CUSTOMER_BULK_ACTION = "/customers/bulk-action"
export const CUSTOMER_CAMPAIGN = "/customers/campaign"
export const CUSTOMER_CAMPAIGNS = "/customers/campaigns"
export const CUSTOMER_BY_ID = (id: string) => `${CUSTOMERS}/${id}`
export const CUSTOMER_STATUS = (id: string) => `${CUSTOMERS}/${id}/status`
export const CUSTOMER_NOTES = (id: string) => `${CUSTOMERS}/${id}/notes`
export const CUSTOMER_PURCHASE_SUMMARY = (id: string) => `${CUSTOMERS}/${id}/purchase-summary`
export const CUSTOMER_PASSWORD_RESET_EMAIL = (entityId: number) =>
  `${CUSTOMERS}/${entityId}/password-reset-email`
export const CUSTOMER_DIRECT_EMAIL = (entityId: number) => `${CUSTOMERS}/${entityId}/direct-email`
export const CUSTOMER_DELETE = (entityId: number) => `${CUSTOMERS}/${entityId}`
export const CUSTOMER_EXPORT_EXCEL = "/customers/export/excel"
export const CUSTOMER_CAMPAIGN_BY_ID = (id: string) => `/customers/campaigns/${id}`
export const CUSTOMER_GUEST_DETAIL = "/customers/guest-detail"

export const ANALYTICS = "/analytics/overview"
export const ANALYTICS_EXPORT = "/analytics/export"

export const REVIEWS = "/reviews"
export const REVIEW_STATS = "/reviews/stats"
export const REVIEW_EXPORT = "/reviews/export"
export const REVIEW_BY_ID = (id: string) => `${REVIEWS}/${id}`
export const REVIEW_STATUS = (id: string) => `${REVIEWS}/${id}/status`

// ─── DISCOUNTS ───────────────────────────────────────────────────────────────
export const DISCOUNTS = "/promotions"
export const DISCOUNT_METRICS = "/promotions/stats"
export const DISCOUNT_EXPORT = "/promotions/export"
export const DISCOUNT_BY_ID = (id: string) => `${DISCOUNTS}/${id}`
export const DISCOUNT_STATUS = (id: string) => `${DISCOUNTS}/${id}/status`
export const DISCOUNT_BY_CODE = (code: string) => `${DISCOUNTS}/code/${code}`

// GEO LOCATION — absolute URLs derived from VITE_EBUY_BASE_URL (/api/geo/...)
export const GEO_COUNTRIES = `${_geoApiBase}/geo/countries`
export const GEO_STATES = (code: string) => `${_geoApiBase}/geo/countries/${code}/states`
export const GEO_LGAS = (code: number) => `${_geoApiBase}/geo/states/${code}/lgas`

// ─── Settings ─────────────────────────────────────────────────────────────────
export const SETTINGS_BRAND_BUSINESS = "/settings/brand-business"
export const SETTINGS_ORDER_MANAGEMENT = "/settings/order-management"
export const SETTINGS_PAYMENTS_FINANCE = "/settings/payments-finance"
export const SETTINGS_SECURITY_ACCESS = "/settings/security-access"
export const SETTINGS_CHANGE_PASSWORD = "/settings/change-password"
export const SETTINGS_NOTIFICATION_PREFERENCES = "/settings/notification-preferences"

// ─── Gift Cards ───────────────────────────────────────────────────────────────
export const GIFT_CARDS = "/gift-cards"
export const GIFT_CARD_METRICS = "/gift-cards/stats"
export const GIFT_CARD_BY_ID = (id: string) => `${GIFT_CARDS}/${id}`
export const GIFT_CARD_EXPORT = "/gift-cards/export"
export const GIFT_CARD_CHANGE_STATUS = (id: string) => `${GIFT_CARDS}/${id}/status`
export const GIFT_CARD_RESEND_EMAIL = (id: string) => `${GIFT_CARDS}/${id}/resend-email`
export const GIFT_CARD_LEDGER = (id: string) => `${GIFT_CARDS}/${id}/ledger`
export const GIFT_CARD_LEDGER_EXPORT = (id: string) => `${GIFT_CARDS}/${id}/ledger/export`

// ─── Vouchers ─────────────────────────────────────────────────────────────────
export const VOUCHERS = "/vouchers"
export const VOUCHER_METRICS = "/vouchers/stats"
export const VOUCHER_BY_ID = (id: string) => `${VOUCHERS}/${id}`
export const VOUCHER_STATUS = (id: string) => `${VOUCHERS}/${id}/status`

// ─── Blogs ────────────────────────────────────────────────────────────────────
export const BLOGS = "/blogs"
export const BLOG_METRICS = "/blogs/stats"
export const BLOG_BY_ID = (id: string) => `${BLOGS}/${id}`
export const BLOG_PUBLISH = (id: string) => `${BLOGS}/${id}/publish`
export const BLOG_ARCHIVE = (id: string) => `${BLOGS}/${id}/archive`

// ─── Mock only (no admin API yet) ────────────────────────────────────────────

export const MESSAGES = "/api/messages"
export const MESSAGE_METRICS = "/api/messages/metrics"

export const LOGS = "/api/logs"

export const NOTIFICATIONS = "/notifications"
export const NOTIFICATIONS_UNREAD_COUNT = "/notifications/unread-count"
export const NOTIFICATION_MARK_READ = (id: string | number) => `/notifications/${id}/read`
export const NOTIFICATIONS_MARK_ALL_READ = "/notifications/mark-all-read"
