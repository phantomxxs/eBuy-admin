// ── Status types ───────────────────────────────────────────────────────────────

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock"
export type InventoryByProductStatus = "available" | "low_stock" | "out_of_stock"
export type TransferStatus = "completed" | "pending" | "cancelled"

// ── Raw API shapes ─────────────────────────────────────────────────────────────

/** Unified item shape returned by both product and location view endpoints */
export interface RawInventoryItem {
  product_id: number
  name: string
  sku: string
  category: string
  categories: string[]
  price: number
  qty: number
  low_stock_alert: number
  low_stock_count: number
  status: string
  product_count: number
  locations_count: number
  /** Only present in location view */
  location_id?: number
  location_name?: string
  last_adjusted?: string
}

export interface RawInventoryLocationDetail {
  location_id: number
  store_name: string
  total_products: number
  total_units: number
  low_stock_count: number
  items: RawInventoryItem[]
  recent_activity: RawInventoryActivityLog[]
}

export interface RawInventoryActivityLog {
  id: string | number
  product_name: string
  sku: string
  activity: string
  adjusted_by: string
  location_name: string
  created_at: string
}

export interface RawInventoryTransfer {
  transfer_id: string | number
  product_name: string
  product_id: string | number
  sku: string
  qty: number
  from_location: string
  to_location: string
  reason: string
  requested_by: string
  status: string
  created_at: string
}

// ── Normalized domain types ────────────────────────────────────────────────────

export interface InventoryByProduct {
  id: string
  product: string
  sku: string
  category: string
  categories: string[]
  price: number
  qty: number
  lowStockAlert: number
  lowStockCount: number
  status: InventoryByProductStatus
  locationsCount: number
  productCount: number
  lastAdjusted: string
}

export interface InventoryByLocation {
  id: string
  storeName: string
  storeId: string
  products: number
  totalUnits: number
  lowStock: number
  lastAdjusted: string
}

export interface InventoryLocationDetail {
  locationId: number
  storeName: string
  totalProducts: number
  totalUnits: number
  lowStockCount: number
  items: InventoryByProduct[]
  recentActivity: InventoryActivityLog[]
}

export interface InventoryActivityLog {
  id: string
  product: string
  sku: string
  activity: string
  by: string
  location: string
  date: string
}

export interface InventoryTransfer {
  id: string
  product: string
  productId: string
  sku: string
  units: number
  from: string
  to: string
  reason: string
  by: string
  status: TransferStatus
}

export interface InventoryMetrics {
  total: number
  inStock: number
  lowStock: number
  outOfStock: number
}

export interface InventoryByProductResponse {
  items: InventoryByProduct[]
  total_count: number
  current_page?: number
  page_size?: number
  total_units_in_stock: number
  low_stock_count: number
  out_of_stock_count: number
  pending_transfers: number
}

// ── Legacy / kept for modal compatibility ─────────────────────────────────────

export interface InventoryItem {
  id: string
  product: string
  sku: string
  category: string
  price: number
  stock: number
  status: InventoryStatus
  createdAt: string
  location: string
}

// ── Payload types ──────────────────────────────────────────────────────────────

export interface UpsertInventoryPayload {
  location_id: number
  product_id: number
  qty: number
  is_in_stock: boolean
}

export interface BulkAssignInventoryPayload {
  productId: number
  locationIds: number[]
  qty: number
}

export interface AdjustStockItem {
  productId: number
  locationId: number
  qty: number
  costPrice?: number
  price?: number
}

export interface AdjustStockPayload {
  adjustmentType: "add" | "remove" | "set"
  reason: string
  notes: string
  items: AdjustStockItem[]
}

export interface CreateInventoryTransferPayload {
  productId: string | number
  fromLocationId: string | number
  toLocationId: string | number
  qty: number
  reason?: string
  notes?: string
}

// ── Query params ───────────────────────────────────────────────────────────────

export interface InventoryQueryParams {
  view?: "product" | "location"
  pageSize?: number | "all"
  currentPage?: number
  search?: string
  locationIds?: string[]
  sortBy?: string
  sortDir?: string
  status?: string
}

export interface InventoryActivityParams {
  pageSize?: number
  currentPage?: number
  search?: string
  adjustmentType?: string
}

export interface InventoryTransfersParams {
  pageSize?: number
  currentPage?: number
  search?: string
  locationIds?: string[]
  status?: string
}
