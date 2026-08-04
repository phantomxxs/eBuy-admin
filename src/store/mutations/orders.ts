import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  acceptOrder,
  cancelOrder,
  processRefund,
  updateOrderFulfillment,
  createWalkInOrder,
  transferOrder,
  exportOrdersCSV,
  getOrderReceipt,
} from "../requests/orders"
import { GET_ORDERS_KEY, GET_ORDER_METRICS_KEY, GET_ORDER_BY_ID_KEY } from "../query-keys"

export const useAcceptOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => acceptOrder(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: [GET_ORDERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_ORDER_METRICS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_ORDER_BY_ID_KEY, id] })
    },
  })
}

export const useCancelOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelOrder(id, { reason }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [GET_ORDERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_ORDER_METRICS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_ORDER_BY_ID_KEY, id] })
    },
  })
}

export const useProcessRefund = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string
      refundType: "full" | "partial"
      reason: string
      notes?: string
    }) => processRefund(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [GET_ORDERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_ORDER_METRICS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_ORDER_BY_ID_KEY, id] })
    },
  })
}

export const useUpdateOrderFulfillment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderFulfillment(id, { status }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [GET_ORDERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_ORDER_BY_ID_KEY, id] })
    },
  })
}

export const useCreateWalkInOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createWalkInOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_ORDERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_ORDER_METRICS_KEY] })
    },
  })
}

export const useTransferOrder = () =>
  useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string
      bankCode: string
      accountNumber: string
      amount: number
      reason?: string
    }) => transferOrder(id, payload),
  })

export const useExportOrdersCSV = () =>
  useMutation({
    mutationFn: () => exportOrdersCSV(),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })

export const useDownloadOrderReceipt = () =>
  useMutation({
    mutationFn: (id: string) => getOrderReceipt(id),
    onSuccess: ({ download_url }) => {
      window.open(download_url, "_blank", "noopener,noreferrer")
    },
  })
