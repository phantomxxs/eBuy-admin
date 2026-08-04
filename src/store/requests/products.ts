import instance from "@/services/axios-instance"
import {
  PRODUCTS,
  PRODUCT_METRICS,
  PRODUCT_SKIN_TYPES,
  PRODUCT_BULK_UPLOAD,
  PRODUCT_EXPORT_CSV,
  PRODUCT_BY_ID,
  PRODUCT_STATUS,
  PRODUCT_INVENTORY_URL,
  PRODUCT_ACTIVITY_LOGS_URL,
  PRODUCT_CREATE_WITH_IMAGES,
  PRODUCT_UPDATE_WITH_IMAGES,
  PRODUCT_ADD_IMAGES,
  PRODUCT_REMOVE_IMAGE,
  PRODUCT_MASTER_CATALOG,
  PRODUCT_MASTER_CATALOG_BY_ID,
  PRODUCT_MASTER_CATALOG_IMPORT,
} from "@/services/apis"
import type {
  Product,
  ProductMetrics,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateProductStatusPayload,
  UpdateProductInventoryPayload,
  ProductActivityLog,
  BulkUploadResult,
  ProductExportResult,
  AddProductImagesPayload,
  RemoveProductImagePayload,
  ProductImagesResult,
  GetProductsParams,
  MasterCatalogProduct,
  MasterCatalogSearchParams,
  ImportFromMasterCatalogPayload,
  MasterCatalogImportResult,
} from "@/types/products"
import type { PaginatedApiResponse } from "@/types/utils"
import { normalizeProduct, normalizeProductMetrics } from "../normalizers/products"

export const getProducts = async (
  params: GetProductsParams = {},
): PaginatedApiResponse<Product> => {
  const response = await instance.get(PRODUCTS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.category && { category_id: params.category }),
      ...(params.locationId && { location_id: params.locationId }),
      ...(params.skinType && { skin_type: params.skinType }),
      ...(params.stockStatus && { stock_status: params.stockStatus }),
      ...(params.priceMin != null && { price_min: params.priceMin }),
      ...(params.priceMax != null && { price_max: params.priceMax }),
      ...(params.dateFrom && { date_from: params.dateFrom }),
      ...(params.dateTo && { date_to: params.dateTo }),
      ...(params.brand && { brand: params.brand }),
    },
  })
  const body = response.data

  return {
    ...body,
    items: body.items.map(normalizeProduct),
  }
}

export const getProductMetrics = async (): Promise<ProductMetrics> => {
  const response = await instance.get(PRODUCT_METRICS)
  return normalizeProductMetrics(response.data)
}

export const getProductById = async (id: string): Promise<Product> => {
  const response = await instance.get(PRODUCT_BY_ID(id))
  return normalizeProduct(response.data)
}

export const createProduct = async (
  payload: CreateProductPayload,
  images?: File[],
): Promise<Product> => {
  if (images?.length) {
    const form = new FormData()

    Object.entries(payload).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        // For array fields, use bracket notation if server expects it
        const fieldKey = `${k}[]` // This will create "locationIds[]"
        v.forEach((item) => form.append(fieldKey, String(item)))
      } else if (v != null) {
        form.append(k, String(v))
      }
    })

    images.forEach((f) => form.append("images[]", f))

    const response = await instance.post(PRODUCT_CREATE_WITH_IMAGES, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return normalizeProduct(response.data)
  }

  const response = await instance.post(PRODUCTS, payload)
  return normalizeProduct(response.data)
}

export const updateProduct = async (
  id: string,
  payload: UpdateProductPayload,
  images?: File[],
): Promise<Product> => {
  const form = new FormData()
  form.append("productId", id)

  Object.entries(payload).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach((item) => form.append(k, String(item)))
    } else if (v != null) {
      form.append(k, String(v))
    }
  })

  if (images?.length) {
    images.forEach((f) => form.append("images[]", f))
  }

  const response = await instance.post(PRODUCT_UPDATE_WITH_IMAGES, form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  const raw = response.data?.data ?? response.data?.product ?? response.data
  return normalizeProduct(raw)
}

export const addProductImages = async (
  payload: AddProductImagesPayload,
): Promise<ProductImagesResult> => {
  const form = new FormData()
  form.append("productId", payload.productId)
  if (payload.makePrimary) form.append("makePrimary", "true")
  payload.images.forEach((f) => form.append("images", f))
  const response = await instance.post(PRODUCT_ADD_IMAGES, form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export const removeProductImage = async (payload: RemoveProductImagePayload): Promise<null> => {
  const params = new URLSearchParams({
    productId: payload.productId,
    imageId: payload.imageId,
  })
  const response = await instance.post(PRODUCT_REMOVE_IMAGE, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  return response.data
}

export const updateProductStatus = async (
  id: string,
  payload: UpdateProductStatusPayload,
): Promise<Product> => {
  const response = await instance.put(PRODUCT_STATUS(id), payload)
  return normalizeProduct(response.data)
}

export const updateProductInventory = async (
  id: string,
  payload: UpdateProductInventoryPayload,
): Promise<null> => {
  const response = await instance.put(PRODUCT_INVENTORY_URL(id), payload)
  return response.data
}

export const deleteProduct = async (id: string): Promise<null> => {
  const response = await instance.delete(PRODUCT_BY_ID(id))
  return response.data
}

export const getProductActivityLogs = async (
  id: string,
): PaginatedApiResponse<ProductActivityLog> => {
  const response = await instance.get(PRODUCT_ACTIVITY_LOGS_URL(id))
  return response.data
  // const body = response.data
  // const items: RawProductActivityLog[] = Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : []
  // return {
  //   items: items.map((r) => ({
  //     action: r.activity ?? "",
  //     performedBy: r.by ?? "",
  //     createdAt: r.date ?? "",
  //   })),
  //   total_count: body?.total_count ?? items.length,
  //   current_page: body?.current_page,
  //   page_size: body?.page_size,
  // }
}

export const getSkinTypeOptions = async (): Promise<{ value: string; label: string }[]> => {
  const response = await instance.get(PRODUCT_SKIN_TYPES)
  const body = response.data
  const raw: unknown[] = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []
  return raw.map((item) => {
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>
      return {
        value: String(obj.id ?? obj.value ?? ""),
        label: String(obj.label ?? obj.name ?? obj.value ?? ""),
      }
    }
    return { value: String(item), label: String(item) }
  })
}

export const bulkUploadProducts = async (file: File): Promise<BulkUploadResult> => {
  const buffer = await file.arrayBuffer()
  const csv = btoa(String.fromCharCode(...new Uint8Array(buffer)))
  const response = await instance.post(PRODUCT_BULK_UPLOAD, { csv, skipHeader: true })
  const body = response.data
  return {
    total_rows: body?.total_rows ?? 0,
    created: body?.created ?? 0,
    skipped: body?.skipped ?? 0,
    errors: body?.errors ?? [],
  }
}

export const exportProductsCSV = async (): Promise<ProductExportResult> => {
  const response = await instance.get(PRODUCT_EXPORT_CSV)
  return response.data
}

export const searchMasterCatalog = async (
  params: MasterCatalogSearchParams = {},
): Promise<{ items: MasterCatalogProduct[]; total_count: number; total_pages: number }> => {
  const response = await instance.get(PRODUCT_MASTER_CATALOG, { params })
  const body = response.data
  const raw = Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : []
  return {
    items: raw.map(normalizeMasterCatalogProduct),
    total_count: body?.total_count ?? raw.length,
    total_pages: body?.total_pages ?? 1,
  }
}

export const getMasterCatalogById = async (id: number): Promise<MasterCatalogProduct> => {
  const response = await instance.get(PRODUCT_MASTER_CATALOG_BY_ID(id))
  const body = response.data?.data ?? response.data
  return normalizeMasterCatalogProduct(body)
}

export const importFromMasterCatalog = async (
  payload: ImportFromMasterCatalogPayload,
): Promise<MasterCatalogImportResult> => {
  const response = await instance.post(PRODUCT_MASTER_CATALOG_IMPORT, payload)
  return response.data
}

function normalizeMasterCatalogProduct(raw: unknown): MasterCatalogProduct {
  const r = (raw ?? {}) as Record<string, unknown>
  const allImages: string[] = Array.isArray(r.image_urls)
    ? (r.image_urls as unknown[]).map(String).filter(Boolean)
    : []
  return {
    id: Number(r.master_product_id ?? r.id ?? r.product_id ?? 0),
    name: String(r.name ?? ""),
    sku: r.sku ? String(r.sku) : undefined,
    brand: r.brand_name ? String(r.brand_name) : r.brand ? String(r.brand) : undefined,
    brandName: r.brand_name ? String(r.brand_name) : r.brand ? String(r.brand) : undefined,
    category: r.category_name
      ? String(r.category_name)
      : r.category
        ? String(r.category)
        : undefined,
    categoryId: r.category_id ? Number(r.category_id) : undefined,
    description: r.description ? String(r.description) : undefined,
    ingredients: Array.isArray(r.ingredients)
      ? (r.ingredients as unknown[]).map(String).filter(Boolean)
      : undefined,
    howToUse: r.usage_instructions
      ? String(r.usage_instructions)
      : r.how_to_use
        ? String(r.how_to_use)
        : undefined,
    sizeVolume: r.size_volume ? String(r.size_volume) : undefined,
    weight: r.weight != null ? Number(r.weight) : undefined,
    imageUrl: r.primary_image_url ? String(r.primary_image_url) : (allImages[0] ?? undefined),
    galleryImages: allImages.length > 1 ? allImages.slice(1) : undefined,
    skinTypes: Array.isArray(r.skin_types)
      ? (r.skin_types as unknown[]).map(String).filter(Boolean)
      : undefined,
    alreadyInInventory: Boolean(r.already_in_inventory),
  }
}
