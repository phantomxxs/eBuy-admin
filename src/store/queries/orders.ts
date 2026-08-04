import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getOrders, getOrderMetrics, getOrderById, getBanks } from "../requests/orders"
import {
  GET_ORDERS_KEY,
  GET_ORDER_METRICS_KEY,
  GET_ORDER_BY_ID_KEY,
  GET_BANKS_KEY,
} from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { OrderQueryParams } from "@/types/orders"

export const useGetOrders = (params: OrderQueryParams) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.ORDERS_VIEW))
  return useQuery({
    queryKey: [GET_ORDERS_KEY, params],
    queryFn: () => getOrders(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetOrderMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.ORDERS_VIEW))
  return useQuery({
    queryKey: [GET_ORDER_METRICS_KEY],
    queryFn: getOrderMetrics,
    enabled: canView,
  })
}

export const useGetOrderById = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.ORDERS_VIEW))
  return useQuery({
    queryKey: [GET_ORDER_BY_ID_KEY, id],
    queryFn: () => getOrderById(id!),
    enabled: !!id && canView,
  })
}

export const useGetBanks = () => useQuery({ queryKey: [GET_BANKS_KEY], queryFn: getBanks })
