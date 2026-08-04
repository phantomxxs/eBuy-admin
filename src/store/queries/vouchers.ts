import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { GET_VOUCHERS_KEY, GET_VOUCHER_BY_ID_KEY, GET_VOUCHER_METRICS_KEY } from "../query-keys"
import { getVoucherById, getVoucherMetrics, getVouchers } from "../requests/vouchers"
import type { GetVouchersParams } from "@/types/vouchers"

export const useGetVouchers = (params: GetVouchersParams = {}) =>
  useQuery({
    queryKey: [GET_VOUCHERS_KEY, params],
    queryFn: () => getVouchers(params),
    placeholderData: keepPreviousData,
  })

export const useGetVoucherMetrics = () =>
  useQuery({
    queryKey: [GET_VOUCHER_METRICS_KEY],
    queryFn: getVoucherMetrics,
  })

export const useGetVoucherById = (id: string | null) =>
  useQuery({
    queryKey: [GET_VOUCHER_BY_ID_KEY, id],
    queryFn: () => getVoucherById(id!),
    enabled: !!id,
  })
