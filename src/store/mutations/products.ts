import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createProduct,
  updateProduct,
  updateProductStatus,
  updateProductInventory,
  deleteProduct,
  bulkUploadProducts,
  exportProductsCSV,
  addProductImages,
  removeProductImage,
  importFromMasterCatalog,
} from "../requests/products"
import { GET_PRODUCTS_KEY, GET_PRODUCT_BY_ID_KEY, GET_PRODUCT_METRICS_KEY } from "../query-keys"
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateProductStatusPayload,
  UpdateProductInventoryPayload,
  AddProductImagesPayload,
  RemoveProductImagePayload,
  ImportFromMasterCatalogPayload,
} from "@/types/products"
import type { PaginatedData } from "@/types/utils"

const DEFAULT_PRODUCT_QUERY_PARAMS = { currentPage: 1, pageSize: 10, search: "" }

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, images }: { payload: CreateProductPayload; images?: File[] }) =>
      createProduct(payload, images),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_METRICS_KEY] })
    },
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      images,
      ...payload
    }: { id: string; images?: File[] } & UpdateProductPayload) =>
      updateProduct(id, payload, images),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY, DEFAULT_PRODUCT_QUERY_PARAMS] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_BY_ID_KEY, id] })
    },
  })
}

export const useUpdateProductStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateProductStatusPayload) =>
      updateProductStatus(id, payload),
    onSuccess: (updatedProduct, { id }) => {
      qc.setQueriesData<PaginatedData<Product>>({ queryKey: [GET_PRODUCTS_KEY] }, (old) => {
        if (!old?.items) return old
        return { ...old, items: old.items.map((p) => (p.id === id ? updatedProduct : p)) }
      })
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_BY_ID_KEY, id] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_METRICS_KEY] })
    },
  })
}

export const useUpdateProductInventory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateProductInventoryPayload) =>
      updateProductInventory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
    },
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_METRICS_KEY] })
    },
  })
}

export const useBulkUploadProducts = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => bulkUploadProducts(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_METRICS_KEY] })
    },
  })
}

export const useAddProductImages = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddProductImagesPayload) => addProductImages(payload),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_BY_ID_KEY, productId] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
    },
  })
}

export const useRemoveProductImage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RemoveProductImagePayload) => removeProductImage(payload),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_BY_ID_KEY, productId] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
    },
  })
}

export const useExportProductsCSV = () =>
  useMutation({
    mutationFn: () => exportProductsCSV(),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })

export const useImportFromMasterCatalog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ImportFromMasterCatalogPayload) => importFromMasterCatalog(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_PRODUCTS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_PRODUCT_METRICS_KEY] })
    },
  })
}
