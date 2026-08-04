import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createCategory,
  updateCategory,
  updateCategoryStatus,
  exportCategoriesCSV,
} from "../requests/categories"
import { GET_CATEGORIES_KEY, GET_CATEGORY_METRICS_KEY } from "../query-keys"
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  UpdateCategoryStatusPayload,
} from "@/types/categories"

export const useCreateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ image, ...payload }: CreateCategoryPayload & { image?: File }) =>
      createCategory(payload, image),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_CATEGORIES_KEY] })
      qc.invalidateQueries({ queryKey: [GET_CATEGORY_METRICS_KEY] })
    },
  })
}

export const useUpdateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, image, ...payload }: { id: string; image?: File } & UpdateCategoryPayload) =>
      updateCategory(id, payload, image),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_CATEGORIES_KEY] })
    },
  })
}

export const useUpdateCategoryStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateCategoryStatusPayload) =>
      updateCategoryStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_CATEGORIES_KEY] })
      qc.invalidateQueries({ queryKey: [GET_CATEGORY_METRICS_KEY] })
    },
  })
}

export const useExportCategoriesCSV = () =>
  useMutation({
    mutationFn: () => exportCategoriesCSV(),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })
