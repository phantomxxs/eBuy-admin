import type {
  InventoryActivityLog,
  InventoryByLocation,
  InventoryByProduct,
  InventoryByProductStatus,
  InventoryLocationDetail,
  InventoryTransfer,
  TransferStatus,
  RawInventoryActivityLog,
  RawInventoryItem,
  RawInventoryLocationDetail,
  RawInventoryTransfer,
} from "@/types/inventory"

function normalizeProductStatus(raw: string): InventoryByProductStatus {
  if (raw === "low_stock") return "low_stock"
  if (raw === "out_of_stock") return "out_of_stock"
  return "available"
}

function normalizeTransferStatus(raw: string): TransferStatus {
  if (raw === "completed") return "completed"
  if (raw === "cancelled") return "cancelled"
  return "pending"
}

export function normalizeInventoryByProduct(raw: RawInventoryItem): InventoryByProduct {
  return {
    id: String(raw.product_id),
    product: raw.name,
    sku: raw.sku,
    category: raw.category,
    categories: raw.categories ?? [],
    price: raw.price,
    qty: raw.qty,
    lowStockAlert: raw.low_stock_alert,
    lowStockCount: raw.low_stock_count,
    status: normalizeProductStatus(raw.status),
    locationsCount: raw.locations_count,
    productCount: raw.product_count,
    lastAdjusted: raw.last_adjusted ?? "",
  }
}

export function normalizeInventoryByLocation(raw: RawInventoryItem): InventoryByLocation {
  const locationId = raw.location_id ?? raw.product_id
  return {
    id: String(locationId),
    storeName: raw.location_name ?? raw.name,
    storeId: String(locationId),
    products: raw.product_count,
    totalUnits: raw.qty,
    lowStock: raw.low_stock_count,
    lastAdjusted: raw.last_adjusted ?? "",
  }
}

export function normalizeInventoryActivityLog(raw: RawInventoryActivityLog): InventoryActivityLog {
  return {
    id: String(raw.id),
    product: raw.product_name,
    sku: raw.sku,
    activity: raw.activity,
    by: raw.adjusted_by,
    location: raw.location_name,
    date: raw.created_at,
  }
}

export function normalizeInventoryTransfer(raw: RawInventoryTransfer): InventoryTransfer {
  return {
    id: String(raw.transfer_id),
    product: raw.product_name,
    productId: String(raw.product_id),
    sku: raw.sku,
    units: raw.qty,
    from: raw.from_location,
    to: raw.to_location,
    reason: raw.reason,
    by: raw.requested_by,
    status: normalizeTransferStatus(raw.status),
  }
}

export function normalizeInventoryLocationDetail(
  raw: RawInventoryLocationDetail,
): InventoryLocationDetail {
  return {
    locationId: raw.location_id,
    storeName: raw.store_name,
    totalProducts: raw.total_products,
    totalUnits: raw.total_units,
    lowStockCount: raw.low_stock_count,
    items: (raw.items ?? []).map(normalizeInventoryByProduct),
    recentActivity: (raw.recent_activity ?? []).map(normalizeInventoryActivityLog),
  }
}
