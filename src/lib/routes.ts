export const ROUTES = {
  // Auth
  login: "/login",
  signup: "/signup",
  verifyEmail: "/verify-email",
  resetPassword: "/reset-password",
  setPassword: "/set-password",
  acceptInvite: "/accept-invite",

  // App — Overview
  dashboard: "/dashboard",

  // App — Catalog
  products: "/products",
  productsBulkUpload: "/products/bulk-upload",
  categories: "/categories",

  // App — Commerce
  orders: "/orders",
  customers: "/customers",
  discounts: "/discounts",
  reviews: "/reviews",

  // App — Operations
  transactions: "/transactions",
  locations: "/locations",
  inventory: "/inventory",
  banners: "/banners",

  // App — Admin
  staff: "/staff",
  analytics: "/analytics",
  logs: "/logs",
  settings: "/settings",

  // App — Integrations
  marketplace: "/marketplace",

  // App — Messaging
  messaging: "/messaging",

  // App — Marketing
  giftCards: "/gift-cards",
  vouchers: "/vouchers",
  blogs: "/blogs",
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
