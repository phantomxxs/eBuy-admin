import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  upsertInventory,
  bulkAssignInventory,
  adjustStock,
  deleteInventoryEntry,
  createInventoryTransfer,
  completeInventoryTransfer,
  cancelInventoryTransfer,
  importInventory,
  exportInventoryCSV,
} from "@/store/requests/inventory"
import {
  GET_INVENTORY_KEY,
  GET_INVENTORY_BY_PRODUCT_KEY,
  GET_INVENTORY_BY_LOCATION_KEY,
  GET_INVENTORY_METRICS_KEY,
  GET_INVENTORY_ACTIVITY_KEY,
  GET_INVENTORY_TRANSFERS_KEY,
  GET_INVENTORY_ADJUSTMENTS_KEY,
} from "@/store/query-keys"

export const useUpsertInventory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertInventory,
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_INVENTORY_KEY] }),
  })
}

export const useBulkAssignInventory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bulkAssignInventory,
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_INVENTORY_KEY] }),
  })
}

export const useAdjustStock = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_BY_PRODUCT_KEY] })
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_BY_LOCATION_KEY] })
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_METRICS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_ADJUSTMENTS_KEY] })
    },
  })
}

export const useDeleteInventoryEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteInventoryEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_INVENTORY_KEY] }),
  })
}

export const useCreateInventoryTransfer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createInventoryTransfer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_TRANSFERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_KEY] })
    },
  })
}

export const useCompleteInventoryTransfer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => completeInventoryTransfer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_TRANSFERS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_KEY] })
    },
  })
}

export const useCancelInventoryTransfer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelInventoryTransfer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_INVENTORY_TRANSFERS_KEY] }),
  })
}

export const useImportInventory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => importInventory(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_KEY] })
      qc.invalidateQueries({ queryKey: [GET_INVENTORY_ACTIVITY_KEY] })
    },
  })
}

export const useExportInventoryCSV = () =>
  useMutation({
    mutationFn: exportInventoryCSV,
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })
