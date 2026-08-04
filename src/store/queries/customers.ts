import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  getCustomers,
  getCustomerMetrics,
  getCustomerById,
  getCustomerNotes,
  getCustomerPurchaseSummary,
  getCustomerCampaigns,
  getCustomerCampaignById,
  getCustomerGuestDetail,
} from "../requests/customers"
import {
  GET_CUSTOMERS_KEY,
  GET_CUSTOMER_METRICS_KEY,
  GET_CUSTOMER_BY_ID_KEY,
  GET_CUSTOMER_NOTES_KEY,
  GET_CUSTOMER_PURCHASE_SUMMARY_KEY,
  GET_CUSTOMER_CAMPAIGNS_KEY,
  GET_CUSTOMER_CAMPAIGN_BY_ID_KEY,
  GET_CUSTOMER_GUEST_DETAIL_KEY,
} from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { GetCustomersParams, GetCustomerCampaignsParams } from "@/types/customers"

export const useCustomerSearch = (search: string, customerType?: string) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_LIST))
  return useQuery({
    queryKey: [GET_CUSTOMERS_KEY, { search, pageSize: 50, customer_type: customerType }],
    queryFn: () => getCustomers({ search, pageSize: 50, customer_type: customerType }),
    select: (res) =>
      (res?.items ?? []).map((c) => ({
        label: `${c.customer_name} — ${c.email}`,
        value: c.entity_id,
        name: c.customer_name,
        email: c.email,
      })),
    enabled: canView,
  })
}

export const useGetCustomers = (params: GetCustomersParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_LIST))
  return useQuery({
    queryKey: [GET_CUSTOMERS_KEY, params],
    queryFn: () => getCustomers(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetCustomerMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_LIST))
  return useQuery({
    queryKey: [GET_CUSTOMER_METRICS_KEY],
    queryFn: getCustomerMetrics,
    enabled: canView,
  })
}

export const useGetCustomerById = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_DETAILS))
  return useQuery({
    queryKey: [GET_CUSTOMER_BY_ID_KEY, id],
    queryFn: () => getCustomerById(id!),
    enabled: !!id && canView,
  })
}

export const useGetCustomerNotes = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_DETAILS))
  return useQuery({
    queryKey: [GET_CUSTOMER_NOTES_KEY, id],
    queryFn: () => getCustomerNotes(id!),
    enabled: !!id && canView,
  })
}

export const useGetCustomerPurchaseSummary = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_DETAILS))
  return useQuery({
    queryKey: [GET_CUSTOMER_PURCHASE_SUMMARY_KEY, id],
    queryFn: () => getCustomerPurchaseSummary(id!),
    enabled: !!id && canView,
  })
}

export const useGetCustomerCampaigns = (params: GetCustomerCampaignsParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_LIST))
  return useQuery({
    queryKey: [GET_CUSTOMER_CAMPAIGNS_KEY, params],
    queryFn: () => getCustomerCampaigns(params),
    enabled: canView,
  })
}

export const useGetCustomerCampaignById = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_DETAILS))
  return useQuery({
    queryKey: [GET_CUSTOMER_CAMPAIGN_BY_ID_KEY, id],
    queryFn: () => getCustomerCampaignById(id!),
    enabled: !!id && canView,
  })
}

export const useGetCustomerGuestDetail = (email: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.CUSTOMERS_VIEW_DETAILS))
  return useQuery({
    queryKey: [GET_CUSTOMER_GUEST_DETAIL_KEY, email],
    queryFn: () => getCustomerGuestDetail(email!),
    enabled: !!email && canView,
  })
}
