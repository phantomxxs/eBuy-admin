import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  getTransactions,
  getTransactionMetrics,
  getTransactionByRef,
} from "../requests/transactions"
import {
  GET_TRANSACTIONS_KEY,
  GET_TRANSACTION_BY_REF_KEY,
  GET_TRANSACTION_METRICS_KEY,
} from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { TransactionQueryParams } from "@/types/transactions"

export const useGetTransactions = (params: TransactionQueryParams) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.TRANSACTIONS_VIEW))
  return useQuery({
    queryKey: [GET_TRANSACTIONS_KEY, params],
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetTransactionMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.TRANSACTIONS_VIEW))
  return useQuery({
    queryKey: [GET_TRANSACTION_METRICS_KEY],
    queryFn: getTransactionMetrics,
    enabled: canView,
  })
}

export const useGetTransactionByRef = (ref: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.TRANSACTIONS_VIEW))
  return useQuery({
    queryKey: [GET_TRANSACTION_BY_REF_KEY, ref],
    queryFn: () => getTransactionByRef(ref!),
    enabled: !!ref && canView,
  })
}
