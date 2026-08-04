import instance from "@/services/axios-instance"
import {
  CATEGORIES,
  CATEGORY_METRICS,
  CATEGORY_DROPDOWN,
  CATEGORY_EXPORT,
  CATEGORY_STATUS,
  CATEGORY_CREATE_WITH_IMAGE,
  CATEGORY_UPDATE_WITH_IMAGE,
} from "@/services/apis"
import type {
  Category,
  CategoryMetrics,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  UpdateCategoryStatusPayload,
} from "@/types/categories"
import type { PaginatedApiResponse } from "@/types/utils"
import type { CategoryQueryParams } from "@/types/categories"

export const getCategories = async (
  params: CategoryQueryParams = {},
): PaginatedApiResponse<Category> => {
  const response = await instance.get(CATEGORIES, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.date_from && { date_from: params.date_from }),
      ...(params.date_to && { date_to: params.date_to }),
    },
  })
  return response.data
}

export const getCategoryMetrics = async (): Promise<CategoryMetrics> => {
  const response = await instance.get(CATEGORY_METRICS)
  return response.data
}

export const createCategory = async (
  payload: CreateCategoryPayload,
  image?: File,
): Promise<Category> => {
  if (image) {
    const form = new FormData()
    form.append("name", payload.name)
    form.append("image", image)
    const response = await instance.post(CATEGORY_CREATE_WITH_IMAGE, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  }
  const response = await instance.post(CATEGORIES, payload)
  return response.data
}

export const updateCategory = async (
  id: string,
  payload: UpdateCategoryPayload,
  image?: File,
): Promise<Category> => {
  const form = new FormData()
  form.append("categoryId", id)
  if (payload.name) form.append("name", payload.name)
  if (image) form.append("image", image)
  const response = await instance.post(CATEGORY_UPDATE_WITH_IMAGE, form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export const updateCategoryStatus = async (
  id: string,
  payload: UpdateCategoryStatusPayload,
): Promise<Category> => {
  const response = await instance.put(CATEGORY_STATUS(id), payload)
  return response.data
}

export const getCategoryDropdown = async (): Promise<{ value: string; label: string }[]> => {
  const response = await instance.get(CATEGORY_DROPDOWN)
  const body = response.data
  const raw: unknown[] = Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : []
  return raw.map((item) => {
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>
      return {
        value: String(obj.id ?? obj.value ?? ""),
        label: String(obj.name ?? obj.label ?? ""),
      }
    }
    return { value: String(item), label: String(item) }
  })
}

export const exportCategoriesCSV = async (): Promise<{
  download_url: string
  filename: string
}> => {
  const response = await instance.get(CATEGORY_EXPORT)
  return response.data
}
