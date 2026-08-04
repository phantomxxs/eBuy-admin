import instance from "@/services/axios-instance"
import type { PaginatedApiResponse } from "@/types/utils"
import {
  normalizeDiscount,
  normalizeDiscountDetail,
  normalizeDiscountMetrics,
} from "../normalizers/discounts"
import type {
  ChangeDiscountStatusPayload,
  CreateDiscountPayload,
  Discount,
  DiscountDetail,
  DiscountMetrics,
  DiscountQueryParams,
  UpdateDiscountPayload,
} from "@/types/discounts"
import {
  DISCOUNT_METRICS,
  DISCOUNT_BY_CODE,
  DISCOUNTS,
  DISCOUNT_BY_ID,
  DISCOUNT_STATUS,
  DISCOUNT_EXPORT,
} from "@/services/apis"

export const getDiscounts = async (
  params: DiscountQueryParams = {},
): PaginatedApiResponse<Discount> => {
  const response = await instance.get(DISCOUNTS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.applies_to && { applies_to: params.applies_to }),
      ...(params.valid_from && { valid_from: params.valid_from }),
      ...(params.valid_to && { valid_to: params.valid_to }),
    },
  })
  const body = response.data
  return {
    ...body,
    items: (body.items ?? []).map(normalizeDiscount),
  }
}

export const getDiscountMetrics = async (): Promise<DiscountMetrics> => {
  const response = await instance.get(DISCOUNT_METRICS)
  return normalizeDiscountMetrics(response.data)
}

export const getDiscountById = async (id: string): Promise<DiscountDetail> => {
  const response = await instance.get(DISCOUNT_BY_ID(id))
  return normalizeDiscountDetail(response.data)
}

export const getDiscountByCode = async (code: string): Promise<DiscountDetail> => {
  const response = await instance.get(DISCOUNT_BY_CODE(code))
  return normalizeDiscountDetail(response.data)
}

export const createDiscount = async (payload: CreateDiscountPayload): Promise<Discount> => {
  const response = await instance.post(DISCOUNTS, payload)
  return normalizeDiscount(response.data)
}

export const updateDiscount = async (
  id: string,
  payload: UpdateDiscountPayload,
): Promise<Discount> => {
  const response = await instance.put(DISCOUNT_BY_ID(id), payload)
  return normalizeDiscount(response.data)
}

export const changeDiscountStatus = async (
  id: string,
  payload: ChangeDiscountStatusPayload,
): Promise<Discount> => {
  const response = await instance.put(DISCOUNT_STATUS(id), payload)
  return normalizeDiscount(response.data)
}

export const deleteDiscount = async (id: string): Promise<null> => {
  const response = await instance.delete(DISCOUNT_BY_ID(id))
  return response.data
}

export const exportDiscountsCSV = async (): Promise<{ url: string }> => {
  const response = await instance.get(DISCOUNT_EXPORT)
  return response.data
}
