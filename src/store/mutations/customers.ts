import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateCustomerStatus,
  updateCustomerProfile,
  addCustomerNote,
  createCustomerCampaign,
  customerBulkAction,
  exportCustomersCSV,
  exportCustomersExcel,
  sendCustomerPasswordResetEmail,
  sendCustomerDirectEmail,
  deleteCustomer,
} from "../requests/customers"
import {
  GET_CUSTOMERS_KEY,
  GET_CUSTOMER_METRICS_KEY,
  GET_CUSTOMER_NOTES_KEY,
  GET_CUSTOMER_BY_ID_KEY,
} from "../query-keys"
import { showAlert } from "@/store/alerts"
import type {
  UpdateCustomerProfilePayload,
  UpdateCustomerStatusPayload,
  CustomerCampaignPayload,
  CustomerBulkActionPayload,
  DirectEmailPayload,
  ExportCustomersParams,
} from "@/types/customers"

export const useUpdateCustomerProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ entityId, ...payload }: { entityId: number } & UpdateCustomerProfilePayload) =>
      updateCustomerProfile(entityId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_CUSTOMERS_KEY] })
    },
  })
}

export const useUpdateCustomerStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateCustomerStatusPayload) =>
      updateCustomerStatus(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [GET_CUSTOMERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_CUSTOMER_METRICS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_CUSTOMER_BY_ID_KEY, id] })
    },
  })
}

export const useAddCustomerNote = (customerId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (note: string) => addCustomerNote(customerId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_CUSTOMER_NOTES_KEY, customerId] })
    },
  })
}

export const useCreateCustomerCampaign = () =>
  useMutation({
    mutationFn: (payload: CustomerCampaignPayload) => createCustomerCampaign(payload),
  })

export const useCustomerBulkAction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CustomerBulkActionPayload) => customerBulkAction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_CUSTOMERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_CUSTOMER_METRICS_KEY] })
    },
  })
}

export const useExportCustomersCSV = () =>
  useMutation({
    mutationFn: (params: ExportCustomersParams = {}) => exportCustomersCSV(params),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })

export const useExportCustomersExcel = () =>
  useMutation({
    mutationFn: (params: ExportCustomersParams = {}) => exportCustomersExcel(params),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })

export const useSendCustomerPasswordResetEmail = () =>
  useMutation({
    mutationFn: (entityId: number) => sendCustomerPasswordResetEmail(entityId),
    onSuccess: () => showAlert({ variant: "success", message: "Password reset email sent" }),
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })

export const useSendCustomerDirectEmail = () =>
  useMutation({
    mutationFn: ({ entityId, ...payload }: { entityId: number } & DirectEmailPayload) =>
      sendCustomerDirectEmail(entityId, payload),
  })

export const useDeleteCustomer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entityId: number) => deleteCustomer(entityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_CUSTOMERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_CUSTOMER_METRICS_KEY] })
    },
  })
}
