import instance from "@/services/axios-instance"
import {
  ORDERS,
  ORDER_METRICS,
  ORDER_EXPORT,
  ORDER_BY_ID,
  ORDER_ACCEPT,
  ORDER_CANCEL,
  ORDER_REFUND,
  ORDER_FULFILLMENT,
  ORDER_TRANSFER,
  ORDER_RECEIPT,
  ORDER_WALK_IN,
  BANKS,
} from "@/services/apis"
import type {
  Order,
  OrderMetrics,
  CancelOrderPayload,
  ProcessRefundPayload,
  UpdateFulfillmentPayload,
  CreateWalkInOrderPayload,
  TransferOrderPayload,
  Bank,
  OrderDetail,
} from "@/types/orders"
import type { ApiResponse, PaginatedApiResponse } from "@/types/utils"
import type { OrderQueryParams } from "@/types/orders"
import { normalizeOrderMetrics } from "@/store/normalizers/orders"

export const getOrders = async (params: OrderQueryParams): PaginatedApiResponse<Order> => {
  const response = await instance.get(ORDERS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.payment_status && { payment_status: params.payment_status }),
      ...(params.fulfillment_status && { fulfillment_status: params.fulfillment_status }),
      ...(params.order_type && { order_type: params.order_type }),
      ...(params.store_location_id && { store_location_id: params.store_location_id }),
      ...(params.amount_min != null && { amount_min: params.amount_min }),
      ...(params.amount_max != null && { amount_max: params.amount_max }),
      ...(params.date_from && { date_from: params.date_from }),
      ...(params.date_to && { date_to: params.date_to }),
    },
  })
  return response.data
}

export const getOrderMetrics = async (): Promise<ApiResponse<OrderMetrics>> => {
  const response = await instance.get(ORDER_METRICS)
  return {
    data: normalizeOrderMetrics(response.data),
    message: "Order metrics fetched successfully",
    status: 200,
    type: "success",
    url: ORDER_METRICS,
  }
}

export const getOrderById = async (id: string): Promise<OrderDetail> => {
  const response = await instance.get(ORDER_BY_ID(id))
  return response.data
}

export const acceptOrder = async (id: string): Promise<null> => {
  const response = await instance.put(ORDER_ACCEPT(id))
  return response.data
}

export const cancelOrder = async (id: string, payload: CancelOrderPayload): Promise<null> => {
  const response = await instance.put(ORDER_CANCEL(id), payload)
  return response.data
}

export const processRefund = async (id: string, payload: ProcessRefundPayload): Promise<null> => {
  const response = await instance.post(ORDER_REFUND(id), payload)
  return response.data
}

export const updateOrderFulfillment = async (
  id: string,
  payload: UpdateFulfillmentPayload,
): Promise<null> => {
  const response = await instance.put(ORDER_FULFILLMENT(id), payload)
  return response.data
}

export const createWalkInOrder = async (payload: CreateWalkInOrderPayload): Promise<Order> => {
  const response = await instance.post(ORDER_WALK_IN, {
    ...payload,
    items: JSON.stringify(payload.items),
  })
  return response.data
}

export const transferOrder = async (id: string, payload: TransferOrderPayload): Promise<null> => {
  const response = await instance.post(ORDER_TRANSFER(id), payload)
  return response.data
}

export const getOrderReceipt = async (
  id: string,
): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(ORDER_RECEIPT(id))
  return response.data
}

export const exportOrdersCSV = async (): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(ORDER_EXPORT)
  return response.data
}

export const getBanks = async (): Promise<Bank[]> => {
  const response = await instance.get(BANKS)
  const body = response.data
  return Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : []
}
