import instance from "@/services/axios-instance"
import { VOUCHERS, VOUCHER_METRICS, VOUCHER_BY_ID, VOUCHER_STATUS } from "@/services/apis"
import type {
  CreateVoucherPayload,
  GetVouchersParams,
  Voucher,
  VoucherMetrics,
  VoucherStatus,
} from "@/types/vouchers"
import type { PaginatedApiResponse } from "@/types/utils"
import { normalizeVoucher, normalizeVoucherMetrics } from "../normalizers/vouchers"

export const getVouchers = async (
  params: GetVouchersParams = {},
): PaginatedApiResponse<Voucher> => {
  const response = await instance.get(VOUCHERS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    },
  })
  const body = response.data
  return { ...body, items: (body.items ?? []).map(normalizeVoucher) }
}

export const getVoucherMetrics = async (): Promise<VoucherMetrics> => {
  const response = await instance.get(VOUCHER_METRICS)
  return normalizeVoucherMetrics(response.data)
}

export const getVoucherById = async (id: string): Promise<Voucher> => {
  const response = await instance.get(VOUCHER_BY_ID(id))
  return normalizeVoucher(response.data)
}

export const createVoucher = async (payload: CreateVoucherPayload): Promise<Voucher> => {
  const response = await instance.post(VOUCHERS, payload)
  return normalizeVoucher(response.data)
}

export const updateVoucher = async (
  id: string,
  payload: Partial<CreateVoucherPayload>,
): Promise<Voucher> => {
  const response = await instance.put(VOUCHER_BY_ID(id), payload)
  return normalizeVoucher(response.data)
}

export const changeVoucherStatus = async (
  id: string,
  status: Extract<VoucherStatus, "active" | "inactive">,
): Promise<Voucher> => {
  const response = await instance.put(VOUCHER_STATUS(id), { status })
  return normalizeVoucher(response.data)
}

export const deleteVoucher = async (id: string): Promise<null> => {
  await instance.delete(VOUCHER_BY_ID(id))
  return null
}

export const generateVoucherCode = async (): Promise<{ code: string }> => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const code = Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("")
  return { code }
}
