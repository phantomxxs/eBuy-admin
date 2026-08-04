import instance from "@/services/axios-instance"
import {
  LOCATIONS,
  LOCATION_EXPORT,
  LOCATION_BY_ID,
  LOCATION_VALIDATE_SHIPBUBBLE,
} from "@/services/apis"
import type {
  Location,
  LocationDetail,
  LocationMetrics,
  LocationsResult,
  CreateLocationPayload,
  LocationProduct,
  LocationProductsResult,
  LocationOrder,
  LocationOrdersResult,
  LocationActivity,
} from "@/types/locations"
import type { ApiResponse, PaginatedQueryParams } from "@/types/utils"

interface RawLocation {
  location_id?: number
  id?: string
  store_code?: string
  name?: string
  address?: string
  location?: string
  phone?: string
  contact_phone_number?: string
  contact_email?: string
  supports_pickup?: boolean
  supports_walkin?: boolean
  is_website?: boolean
  always_fulfill?: boolean
  status?: string
  is_active?: boolean
  country_code?: string
  country?: string
  state_id?: number
  state?: string
  lga_id?: number
  lga?: string
  city?: string
}

interface RawLocationsResponse {
  items?: RawLocation[]
  total_locations?: number
  active_locations?: number
  inactive_locations?: number
}

function normalizeLocation(r: RawLocation): Location {
  const status = r.status === "active" ? "active" : r.status === "closed" ? "closed" : "inactive"
  return {
    id: String(r.location_id ?? r.id ?? ""),
    name: r.name ?? "",
    storeId: r.store_code ?? "",
    address: r.address ?? r.location ?? "",
    contact: r.contact_email ?? "",
    pickupEnabled: r.supports_pickup ?? false,
    walkInEnabled: r.supports_walkin ?? false,
    alwaysFufill: r.always_fulfill ?? r.is_website ?? false,
    status: status as Location["status"],
  }
}

function normalizeMetrics(raw: RawLocationsResponse): LocationMetrics {
  return {
    total: raw.total_locations ?? raw.items?.length ?? 0,
    active: raw.active_locations ?? 0,
    inactive: raw.inactive_locations ?? 0,
  }
}

export const getLocations = async (params: PaginatedQueryParams = {}): Promise<LocationsResult> => {
  const response = await instance.get(LOCATIONS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    },
  })
  const raw: RawLocationsResponse = response.data?.data ?? response.data ?? {}
  const items = (raw.items ?? []).map(normalizeLocation)
  const metrics = normalizeMetrics(raw)
  return {
    items,
    total_count: raw.total_locations ?? items.length,
    metrics,
  }
}

export const getLocationById = async (id: string): Promise<LocationDetail> => {
  const response = await instance.get(LOCATION_BY_ID(id))
  const raw: RawLocation & Record<string, unknown> = response.data?.data ?? response.data ?? {}
  return {
    ...normalizeLocation(raw),
    phone: String(raw.phone ?? raw.contact_phone_number ?? ""),
    createdAt: String(raw.created_at ?? raw.date_created ?? ""),
    lastActivity: String(raw.last_activity ?? raw.last_login ?? ""),
    lga: String(raw.lga ?? raw.city ?? ""),
    state: String(raw.state ?? ""),
    stateId: raw.state_id ? Number(raw.state_id) : undefined,
    countryCode: raw.country_code ?? (raw.country as string | undefined),
    lgaId: raw.lga_id ? Number(raw.lga_id) : undefined,
  }
}

export const createLocation = async (
  payload: CreateLocationPayload,
): Promise<ApiResponse<Location>> => {
  const response = await instance.post(LOCATIONS, payload)
  return response.data
}

export const updateLocation = async (
  id: string,
  payload: CreateLocationPayload,
): Promise<ApiResponse<Location>> => {
  const response = await instance.put(LOCATION_BY_ID(id), payload)
  return response.data
}

export const deleteLocation = async (id: string): Promise<ApiResponse<null>> => {
  const response = await instance.delete(LOCATION_BY_ID(id))
  return response.data
}

export const exportLocationsCSV = async (): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(LOCATION_EXPORT)
  return response.data
}

export const validateShipbubbleAddress = async (
  id: string,
): Promise<{ valid: boolean; message?: string }> => {
  const response = await instance.post(LOCATION_VALIDATE_SHIPBUBBLE(id))
  return response.data
}

export const getLocationProducts = async (id: string): Promise<LocationProductsResult> => {
  const response = await instance.get("/products", {
    params: { locationId: id, pageSize: 25, currentPage: 1 },
  })
  const raw = response.data
  const rawItems = (raw.items ?? []) as Record<string, unknown>[]
  const items: LocationProduct[] = rawItems.map((p) => ({
    id: String(p.product_id ?? p.id ?? ""),
    name: String(p.product_name ?? p.name ?? ""),
    sku: String(p.sku ?? ""),
    stock: Number(p.stock ?? p.stock_qty ?? 0),
    purchased: Number(p.total_purchased ?? 0),
    lastPurchased: (p.last_purchased_at ?? null) as string | null,
  }))
  return {
    items,
    totalProducts: Number(raw.total_count ?? raw.total ?? items.length),
    activeProducts: items.filter((p) => p.stock > 0).length,
  }
}

export const getLocationOrders = async (id: string): Promise<LocationOrdersResult> => {
  const response = await instance.get("/orders", {
    params: { locationId: id, pageSize: 25, currentPage: 1 },
  })
  const raw = response.data
  const rawItems = (raw.items ?? []) as Record<string, unknown>[]
  const items: LocationOrder[] = rawItems.map((o) => ({
    id: String(o.increment_id ?? o.order_id ?? ""),
    customer: String(o.customer_name ?? ""),
    amount: Number(o.grand_total ?? 0),
    status: String(o.fulfillment_status ?? o.status ?? ""),
  }))
  return {
    items,
    totalOrders: Number(raw.total_count ?? raw.total ?? items.length),
    pendingOrders: items.filter((o) => o.status === "pending" || o.status === "unfulfilled").length,
  }
}

export const getLocationActivity = async (id: string): Promise<LocationActivity[]> => {
  const response = await instance.get("/activity-logs", {
    params: { targetType: "location", targetId: id, pageSize: 25, currentPage: 1 },
  })
  const rawItems = (response.data?.items ?? []) as Record<string, unknown>[]
  return rawItems.map((a) => ({
    date: String(a.created_at ?? a.date ?? ""),
    activity: String(a.activity ?? a.description ?? a.message ?? ""),
    by: String(a.by ?? a.performed_by ?? a.staff_name ?? ""),
  }))
}
