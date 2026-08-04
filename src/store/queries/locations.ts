import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  getLocations,
  getLocationById,
  getLocationProducts,
  getLocationOrders,
  getLocationActivity,
} from "../requests/locations"
import {
  GET_LOCATIONS_KEY,
  GET_LOCATION_METRICS_KEY,
  GET_LOCATION_BY_ID_KEY,
  GET_LOCATION_PRODUCTS_KEY,
  GET_LOCATION_ORDERS_KEY,
  GET_LOCATION_ACTIVITY_KEY,
} from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { PaginatedQueryParams } from "@/types/utils"

export const useGetLocations = (params: PaginatedQueryParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.LOCATIONS_VIEW))
  return useQuery({
    queryKey: [GET_LOCATIONS_KEY, params],
    queryFn: () => getLocations(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetLocationMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.LOCATIONS_VIEW))
  return useQuery({
    queryKey: [GET_LOCATION_METRICS_KEY],
    queryFn: () => getLocations({}),
    select: (res) => res.metrics,
    enabled: canView,
  })
}

export const useLocationOptions = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.LOCATIONS_VIEW))
  const { data, isLoading } = useQuery({
    queryKey: [GET_LOCATIONS_KEY, { pageSize: 200 }],
    queryFn: () => getLocations({ pageSize: 200 }),
    select: (res) => [
      { label: "All stores", value: "all" },
      ...res.items.map((l) => ({ label: l.name, value: l.id })),
    ],
    enabled: canView,
  })
  return { options: data ?? [], isLoading }
}

export const useLocationSearch = (params: PaginatedQueryParams & { walkInOnly?: boolean }) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.LOCATIONS_VIEW))
  const { walkInOnly, ...queryParams } = params
  return useQuery({
    queryKey: [GET_LOCATIONS_KEY, params],
    queryFn: () => getLocations(queryParams),
    select: (res) => {
      const items = walkInOnly ? res.items.filter((l) => l.walkInEnabled) : res.items
      return items.map((l) => ({ label: l.name, value: l.id }))
    },
    enabled: canView,
  })
}

export const useGetLocationById = (id: string) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.LOCATIONS_VIEW))
  return useQuery({
    queryKey: [GET_LOCATION_BY_ID_KEY, id],
    queryFn: () => getLocationById(id),
    enabled: !!id && canView,
  })
}

export const useGetLocationProducts = (locationId: string) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.LOCATIONS_VIEW))
  return useQuery({
    queryKey: [GET_LOCATION_PRODUCTS_KEY, locationId],
    queryFn: () => getLocationProducts(locationId),
    enabled: !!locationId && canView,
  })
}

export const useGetLocationOrders = (locationId: string) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.LOCATIONS_VIEW))
  return useQuery({
    queryKey: [GET_LOCATION_ORDERS_KEY, locationId],
    queryFn: () => getLocationOrders(locationId),
    enabled: !!locationId && canView,
  })
}

export const useGetLocationActivity = (locationId: string) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.LOCATIONS_VIEW))
  return useQuery({
    queryKey: [GET_LOCATION_ACTIVITY_KEY, locationId],
    queryFn: () => getLocationActivity(locationId),
    enabled: !!locationId && canView,
  })
}
