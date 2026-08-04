import instance from "@/services/axios-instance"
import {
  INVENTORY,
  INVENTORY_SAVE,
  INVENTORY_BULK,
  INVENTORY_ADJUST,
  INVENTORY_IMPORT,
  INVENTORY_EXPORT,
  INVENTORY_ACTIVITY,
  INVENTORY_TRANSFERS,
  INVENTORY_TRANSFER_BY_ID,
  INVENTORY_TRANSFER_COMPLETE,
  INVENTORY_TRANSFER_CANCEL,
  INVENTORY_LOCATION_DETAIL,
  INVENTORY_BY_ID,
  INVENTORY_ADJUSTMENTS,
  INVENTORY_METRICS,
} from "@/services/apis"
import { mockInventoryMetrics } from "@/mock-data/inventory"
import type {
  InventoryByLocation,
  InventoryByProductResponse,
  InventoryLocationDetail,
  InventoryActivityLog,
  InventoryTransfer,
  InventoryMetrics,
  InventoryQueryParams,
  InventoryActivityParams,
  InventoryTransfersParams,
  RawInventoryItem,
  RawInventoryLocationDetail,
  RawInventoryActivityLog,
  RawInventoryTransfer,
  UpsertInventoryPayload,
  BulkAssignInventoryPayload,
  AdjustStockPayload,
  CreateInventoryTransferPayload,
} from "@/types/inventory"
import type { ApiResponse, PaginatedData } from "@/types/utils"
import {
  normalizeInventoryByProduct,
  normalizeInventoryByLocation,
  normalizeInventoryActivityLog,
  normalizeInventoryTransfer,
  normalizeInventoryLocationDetail,
} from "../normalizers/inventory"

// ── Helpers ────────────────────────────────────────────────────────────────────

function locationIdsParams(ids?: string[]) {
  if (!ids?.length) return {}
  return Object.fromEntries(ids.map((id, i) => [`locationIds[${i}]`, id]))
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export const getInventoryProductView = async (
  params: InventoryQueryParams = {},
): Promise<InventoryByProductResponse> => {
  const response = await instance.get(INVENTORY, {
    params: {
      view: "product",
      currentPage: params.currentPage ?? 1,
      pageSize: params.pageSize ?? 25,
      sortBy: params.sortBy ?? "last_adjusted_on",
      sortDir: params.sortDir ?? "DESC",
      ...(params.search !== undefined && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...locationIdsParams(params.locationIds),
    },
  })
  const body = response.data as PaginatedData<RawInventoryItem> & {
    total_units_in_stock?: number
    low_stock_count?: number
    out_of_stock_count?: number
    pending_transfers?: number
  }
  return {
    ...body,
    items: (body.items ?? []).map(normalizeInventoryByProduct),
    total_units_in_stock: body.total_units_in_stock ?? 0,
    low_stock_count: body.low_stock_count ?? 0,
    out_of_stock_count: body.out_of_stock_count ?? 0,
    pending_transfers: body.pending_transfers ?? 0,
  }
}

export const getInventoryLocationView = async (
  params: InventoryQueryParams = {},
): Promise<PaginatedData<InventoryByLocation>> => {
  const response = await instance.get(INVENTORY, {
    params: {
      view: "location",
      currentPage: params.currentPage ?? 1,
      pageSize: params.pageSize ?? 25,
      sortBy: params.sortBy ?? "last_adjusted_on",
      sortDir: params.sortDir ?? "DESC",
      ...(params.search && { search: params.search }),
      ...locationIdsParams(params.locationIds),
    },
  })
  const body = response.data as PaginatedData<RawInventoryItem>
  return {
    ...body,
    items: (body.items ?? []).map(normalizeInventoryByLocation),
  }
}

export const getInventoryLocationDetail = async (
  id: string,
  params: { pageSize?: number; currentPage?: number } = {},
): Promise<InventoryLocationDetail> => {
  const response = await instance.get(INVENTORY_LOCATION_DETAIL(id), {
    params: { pageSize: params.pageSize ?? 25, currentPage: params.currentPage ?? 1 },
  })
  return normalizeInventoryLocationDetail(response.data as RawInventoryLocationDetail)
}

export const getInventoryActivity = async (
  params: InventoryActivityParams = {},
): Promise<PaginatedData<InventoryActivityLog>> => {
  const response = await instance.get(INVENTORY_ACTIVITY, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      currentPage: params.currentPage ?? 1,
      pageSize: params.pageSize ?? 25,
      ...(params.search && { search: params.search }),
      ...(params.adjustmentType && { adjustmentType: params.adjustmentType }),
    },
  })
  const body = response.data as PaginatedData<RawInventoryActivityLog>
  return {
    ...body,
    items: (body.items ?? []).map(normalizeInventoryActivityLog),
  }
}

export const getInventoryTransfers = async (
  params: InventoryTransfersParams = {},
): Promise<PaginatedData<InventoryTransfer>> => {
  const response = await instance.get(INVENTORY_TRANSFERS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      currentPage: params.currentPage ?? 1,
      pageSize: params.pageSize ?? 25,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...locationIdsParams(params.locationIds),
    },
  })
  const body = response.data as PaginatedData<RawInventoryTransfer>
  return {
    ...body,
    items: (body.items ?? []).map(normalizeInventoryTransfer),
  }
}

export const getInventoryMetrics = async (): Promise<ApiResponse<InventoryMetrics>> => {
  // No dedicated metrics endpoint — derived client-side from mock
  return {
    data: mockInventoryMetrics,
    message: "Inventory metrics fetched successfully",
    status: 200,
    type: "success",
    url: INVENTORY_METRICS,
  }
}

export const getAdjustmentHistory = async (): Promise<ApiResponse<unknown[]>> => {
  const response = await instance.get(INVENTORY_ADJUSTMENTS)
  return response.data
}

export const getInventoryByTransferId = async (id: string): Promise<InventoryTransfer> => {
  const response = await instance.get(INVENTORY_TRANSFER_BY_ID(id))
  return normalizeInventoryTransfer(response.data as RawInventoryTransfer)
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export const upsertInventory = async (
  payload: UpsertInventoryPayload,
): Promise<ApiResponse<unknown>> => {
  const response = await instance.post(INVENTORY_SAVE, { item: payload })
  return response.data
}

export const bulkAssignInventory = async (
  payload: BulkAssignInventoryPayload,
): Promise<ApiResponse<null>> => {
  const response = await instance.post(INVENTORY_BULK, payload)
  return response.data
}

export const adjustStock = async (payload: AdjustStockPayload): Promise<ApiResponse<null>> => {
  const response = await instance.post(INVENTORY_ADJUST, payload)
  return response.data
}

export const createInventoryTransfer = async (
  payload: CreateInventoryTransferPayload,
): Promise<InventoryTransfer> => {
  const response = await instance.post(INVENTORY_TRANSFERS, payload)
  return normalizeInventoryTransfer(response.data as RawInventoryTransfer)
}

export const completeInventoryTransfer = async (id: string): Promise<null> => {
  const response = await instance.post(INVENTORY_TRANSFER_COMPLETE(id))
  return response.data
}

export const cancelInventoryTransfer = async (id: string): Promise<null> => {
  const response = await instance.post(INVENTORY_TRANSFER_CANCEL(id))
  return response.data
}

export const importInventory = async (file: File): Promise<null> => {
  const buffer = await file.arrayBuffer()
  const csv = btoa(String.fromCharCode(...new Uint8Array(buffer)))
  const response = await instance.post(INVENTORY_IMPORT, { csv, skipHeader: true })
  return response.data
}

export const exportInventoryCSV = async (params?: {
  view?: "product" | "location"
  sortBy?: string
  sortDir?: string
  locationIds?: string[]
}): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(INVENTORY_EXPORT, {
    params: {
      view: params?.view ?? "product",
      sortBy: params?.sortBy ?? "last_adjusted_on",
      sortDir: params?.sortDir ?? "DESC",
      ...locationIdsParams(params?.locationIds),
    },
  })
  return response.data
}

export const deleteInventoryEntry = async (id: string): Promise<ApiResponse<null>> => {
  const response = await instance.delete(INVENTORY_BY_ID(id))
  return response.data
}
