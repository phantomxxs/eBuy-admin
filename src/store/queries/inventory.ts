import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  getInventoryProductView,
  getInventoryLocationView,
  getInventoryLocationDetail,
  getInventoryActivity,
  getInventoryTransfers,
  getInventoryMetrics,
  getAdjustmentHistory,
} from "../requests/inventory"
import {
  GET_INVENTORY_METRICS_KEY,
  GET_INVENTORY_ACTIVITY_KEY,
  GET_INVENTORY_BY_LOCATION_KEY,
  GET_INVENTORY_BY_PRODUCT_KEY,
  GET_INVENTORY_TRANSFERS_KEY,
  GET_INVENTORY_ADJUSTMENTS_KEY,
  GET_INVENTORY_LOCATION_DETAIL_KEY,
} from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type {
  InventoryQueryParams,
  InventoryActivityParams,
  InventoryTransfersParams,
} from "@/types/inventory"

export const useGetInventoryMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.INVENTORY_VIEW))
  return useQuery({
    queryKey: [GET_INVENTORY_METRICS_KEY],
    queryFn: getInventoryMetrics,
    enabled: canView,
  })
}

export const useGetInventoryByProduct = (params: InventoryQueryParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.INVENTORY_VIEW))
  return useQuery({
    queryKey: [GET_INVENTORY_BY_PRODUCT_KEY, params],
    queryFn: () => getInventoryProductView(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetInventoryByLocation = (params: InventoryQueryParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.INVENTORY_VIEW))
  return useQuery({
    queryKey: [GET_INVENTORY_BY_LOCATION_KEY, params],
    queryFn: () => getInventoryLocationView(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetInventoryLocationDetail = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.INVENTORY_VIEW))
  return useQuery({
    queryKey: [GET_INVENTORY_LOCATION_DETAIL_KEY, id],
    queryFn: () => getInventoryLocationDetail(id!),
    enabled: !!id && canView,
  })
}

export const useGetInventoryActivity = (params: InventoryActivityParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.INVENTORY_VIEW))
  return useQuery({
    queryKey: [GET_INVENTORY_ACTIVITY_KEY, params],
    queryFn: () => getInventoryActivity(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetInventoryTransfers = (params: InventoryTransfersParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.INVENTORY_VIEW))
  return useQuery({
    queryKey: [GET_INVENTORY_TRANSFERS_KEY, params],
    queryFn: () => getInventoryTransfers(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetAdjustmentHistory = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.INVENTORY_VIEW))
  return useQuery({
    queryKey: [GET_INVENTORY_ADJUSTMENTS_KEY],
    queryFn: getAdjustmentHistory,
    enabled: canView,
  })
}

export const useInventoryProductOptions = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.INVENTORY_VIEW))
  const { data, isLoading } = useQuery({
    queryKey: [GET_INVENTORY_BY_PRODUCT_KEY, { pageSize: 200 }],
    queryFn: () => getInventoryProductView({ pageSize: 200 }),
    select: (res) => res.items.map((p) => ({ label: p.product, value: p.id })),
    enabled: canView,
  })
  return { options: data ?? [], isLoading }
}
