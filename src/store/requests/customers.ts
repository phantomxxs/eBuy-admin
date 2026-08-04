import instance from "@/services/axios-instance"
import {
  CUSTOMERS,
  CUSTOMER_METRICS,
  CUSTOMER_BY_ID,
  CUSTOMER_STATUS,
  CUSTOMER_NOTES,
  CUSTOMER_EXPORT,
  CUSTOMER_EXPORT_EXCEL,
  CUSTOMER_BULK_ACTION,
  CUSTOMER_CAMPAIGN,
  CUSTOMER_CAMPAIGNS,
  CUSTOMER_CAMPAIGN_BY_ID,
  CUSTOMER_GUEST_DETAIL,
  CUSTOMER_PURCHASE_SUMMARY,
  CUSTOMER_PASSWORD_RESET_EMAIL,
  CUSTOMER_DIRECT_EMAIL,
  CUSTOMER_DELETE,
} from "@/services/apis"
import type {
  Campaign,
  CampaignDetail,
  CustomerDetail,
  CustomerMetrics,
  CustomerNote,
  CustomerPurchaseSummary,
  ExportCustomersParams,
  UpdateCustomerProfilePayload,
  UpdateCustomerStatusPayload,
  CustomerCampaignPayload,
  CustomerBulkActionPayload,
  DirectEmailPayload,
  GetCustomersParams,
  GetCustomerCampaignsParams,
  RawCampaign,
  RawCampaignDetail,
  RawCustomerMetrics,
} from "@/types/customers"
import type { PaginatedApiResponse, PaginatedData } from "@/types/utils"
import {
  normalizeCampaign,
  normalizeCampaignDetail,
  normalizeCustomerMetrics,
} from "../normalizers/customers"

export const getCustomers = async (
  params: GetCustomersParams = {},
): PaginatedApiResponse<CustomerDetail> => {
  const response = await instance.get(CUSTOMERS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.customer_type && { customer_type: params.customer_type }),
    },
  })
  return response.data
}

export const getCustomerMetrics = async (): Promise<CustomerMetrics> => {
  const response = await instance.get(CUSTOMER_METRICS)
  return normalizeCustomerMetrics(response.data as RawCustomerMetrics)
}

export const getCustomerById = async (id: string): Promise<CustomerDetail> => {
  const response = await instance.get(CUSTOMER_BY_ID(id))
  return response.data
}

export const updateCustomerStatus = async (
  id: string,
  payload: UpdateCustomerStatusPayload,
): Promise<CustomerDetail> => {
  const response = await instance.put(CUSTOMER_STATUS(id), payload)
  return response.data
}

export const getCustomerNotes = async (id: string): Promise<CustomerNote[]> => {
  const response = await instance.get(CUSTOMER_NOTES(id))
  const body = response.data
  return Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : []
}

export const addCustomerNote = async (id: string, note: string): Promise<CustomerNote> => {
  const response = await instance.post(CUSTOMER_NOTES(id), { note })
  return response.data
}

export const getCustomerPurchaseSummary = async (id: string): Promise<CustomerPurchaseSummary> => {
  const response = await instance.get(CUSTOMER_PURCHASE_SUMMARY(id))
  return response.data
}

export const createCustomerCampaign = async (payload: CustomerCampaignPayload): Promise<null> => {
  const response = await instance.post(CUSTOMER_CAMPAIGN, payload)
  return response.data
}

export const updateCustomerProfile = async (
  entityId: number,
  payload: UpdateCustomerProfilePayload,
): Promise<CustomerDetail> => {
  const response = await instance.put(CUSTOMER_BY_ID(String(entityId)), payload)
  return response.data
}

export const getCustomerCampaigns = async (
  params: GetCustomerCampaignsParams = {},
): Promise<PaginatedData<Campaign>> => {
  const response = await instance.get(CUSTOMER_CAMPAIGNS, { params })
  const body = response.data as PaginatedData<RawCampaign>
  return {
    ...body,
    items: (body.items ?? []).map(normalizeCampaign),
  }
}

export const customerBulkAction = async (payload: CustomerBulkActionPayload): Promise<null> => {
  const response = await instance.post(CUSTOMER_BULK_ACTION, payload)
  return response.data
}

export const exportCustomersCSV = async (
  params: ExportCustomersParams = {},
): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(CUSTOMER_EXPORT, {
    params: {
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    },
  })
  return response.data
}

export const exportCustomersExcel = async (
  params: ExportCustomersParams = {},
): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(CUSTOMER_EXPORT_EXCEL, {
    params: {
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    },
  })
  return response.data
}

export const getCustomerCampaignById = async (id: string): Promise<CampaignDetail> => {
  const response = await instance.get(CUSTOMER_CAMPAIGN_BY_ID(id))
  return normalizeCampaignDetail(response.data as RawCampaignDetail)
}

export const getCustomerGuestDetail = async (email: string): Promise<CustomerDetail> => {
  const response = await instance.get(CUSTOMER_GUEST_DETAIL, { params: { email } })
  return response.data
}

export const sendCustomerPasswordResetEmail = async (entityId: number): Promise<null> => {
  const response = await instance.post(CUSTOMER_PASSWORD_RESET_EMAIL(entityId))
  return response.data
}

export const sendCustomerDirectEmail = async (
  entityId: number,
  payload: DirectEmailPayload,
): Promise<null> => {
  const response = await instance.post(CUSTOMER_DIRECT_EMAIL(entityId), payload)
  return response.data
}

export const deleteCustomer = async (entityId: number): Promise<null> => {
  const response = await instance.delete(CUSTOMER_DELETE(entityId))
  return response.data
}
