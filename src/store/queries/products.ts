import { useQuery, keepPreviousData } from "@tanstack/react-query"
import type { GetProductsParams, MasterCatalogSearchParams } from "@/types/products"
import {
  getProducts,
  getProductById,
  getProductMetrics,
  getProductActivityLogs,
  getSkinTypeOptions,
  searchMasterCatalog,
  getMasterCatalogById,
} from "../requests/products"
import {
  GET_PRODUCTS_KEY,
  GET_PRODUCT_BY_ID_KEY,
  GET_PRODUCT_METRICS_KEY,
  GET_PRODUCT_ACTIVITY_KEY,
  GET_SKIN_TYPES_KEY,
  GET_MASTER_CATALOG_KEY,
  GET_MASTER_CATALOG_BY_ID_KEY,
} from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"

export const useGetProducts = (params: GetProductsParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.PRODUCTS_VIEW))
  return useQuery({
    queryKey: [GET_PRODUCTS_KEY, params],
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetProductById = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.PRODUCTS_VIEW))
  return useQuery({
    queryKey: [GET_PRODUCT_BY_ID_KEY, id],
    queryFn: () => getProductById(id!),
    enabled: !!id && canView,
    retry: false,
  })
}

export const useGetProductMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.PRODUCTS_VIEW))
  return useQuery({
    queryKey: [GET_PRODUCT_METRICS_KEY],
    queryFn: getProductMetrics,
    enabled: canView,
  })
}

export const useGetProductActivityLogs = (productId: string) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.PRODUCTS_VIEW))
  return useQuery({
    queryKey: [GET_PRODUCT_ACTIVITY_KEY, productId],
    queryFn: () => getProductActivityLogs(productId),
    enabled: !!productId && canView,
  })
}

export const useGetSkinTypeOptions = () =>
  useQuery({
    queryKey: [GET_SKIN_TYPES_KEY],
    queryFn: getSkinTypeOptions,
    placeholderData: [],
  })

export const useProductSearch = (search: string) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.PRODUCTS_VIEW))
  return useQuery({
    queryKey: [GET_PRODUCTS_KEY, { search, pageSize: 100 }],
    queryFn: () => getProducts({ search, pageSize: 100 }),
    select: (res) => res.items.map((p) => ({ label: p.name, value: p.id })),
    enabled: canView,
  })
}

export const useSearchMasterCatalog = (params: MasterCatalogSearchParams) =>
  useQuery({
    queryKey: [GET_MASTER_CATALOG_KEY, params],
    queryFn: () => searchMasterCatalog(params),
    placeholderData: keepPreviousData,
  })

export const useGetMasterCatalogById = (id: number | null) =>
  useQuery({
    queryKey: [GET_MASTER_CATALOG_BY_ID_KEY, id],
    queryFn: () => getMasterCatalogById(id!),
    enabled: id != null && id > 0,
    retry: false,
  })
