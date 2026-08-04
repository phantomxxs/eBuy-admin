export type LocationStatus = "active" | "inactive" | "closed"

export interface Location {
  id: string
  name: string
  storeId: string
  address: string
  contact: string
  pickupEnabled: boolean
  walkInEnabled: boolean
  alwaysFufill: boolean
  status: LocationStatus
}

export interface LocationDetail extends Location {
  phone?: string
  createdAt?: string
  lastActivity?: string
  lga?: string
  state?: string
  stateId?: number
  countryCode?: string
  lgaId?: number
}

export interface LocationMetrics {
  total: number
  active: number
  inactive: number
}

export interface LocationsPage {
  items: Location[]
  metrics: LocationMetrics
}

export interface LocationsResult {
  items: Location[]
  total_count: number
  metrics: LocationMetrics
}

export interface CreateLocationPayload {
  name: string
  address: string
  city: string
  state: string
  stateId?: number
  phone: string
  contactEmail?: string
  storeCode?: string
  isActive?: boolean
  supportsPickup?: boolean
  supportsWalkin?: boolean
  supportsDelivery?: boolean
  always_fulfill?: boolean
  sortOrder?: number
}

export interface LocationProduct {
  id: string
  name: string
  sku: string
  stock: number
  purchased: number
  lastPurchased: string | null
}

export interface LocationProductsResult {
  items: LocationProduct[]
  totalProducts: number
  activeProducts: number
}

export interface LocationOrder {
  id: string
  customer: string
  amount: number
  status: string
}

export interface LocationOrdersResult {
  items: LocationOrder[]
  totalOrders: number
  pendingOrders: number
}

export interface LocationActivity {
  date: string
  activity: string
  by: string
}
