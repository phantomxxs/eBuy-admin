import { useMutation, useQueryClient } from "@tanstack/react-query"
import { showAlert } from "@/store/alerts"
import {
  changeDiscountStatus,
  createDiscount,
  deleteDiscount,
  exportDiscountsCSV,
  getDiscountByCode,
  updateDiscount,
} from "../requests/discounts"
import { GET_DISCOUNT_BY_ID_KEY, GET_DISCOUNTS_KEY } from "../query-keys"

export const useCreateDiscount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createDiscount,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_DISCOUNTS_KEY] })
      showAlert({ variant: "success", message: "Discount created successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useUpdateDiscount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateDiscount>[1] }) =>
      updateDiscount(id, payload),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [GET_DISCOUNTS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_DISCOUNT_BY_ID_KEY, id] })
      showAlert({ variant: "success", message: "Discount updated successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useChangeDiscountStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Parameters<typeof changeDiscountStatus>[1]
    }) => changeDiscountStatus(id, payload),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [GET_DISCOUNTS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_DISCOUNT_BY_ID_KEY, id] })
      showAlert({ variant: "success", message: "Discount status updated" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useDeleteDiscount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDiscount(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_DISCOUNTS_KEY] })
      showAlert({ variant: "success", message: "Discount deleted" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useValidateDiscountCode = () =>
  useMutation({ mutationFn: (code: string) => getDiscountByCode(code) })

export const useExportDiscountsCSV = () =>
  useMutation({
    mutationFn: exportDiscountsCSV,
    onSuccess: (data) => {
      if (data.url) {
        const a = document.createElement("a")
        a.href = data.url
        a.download = "discounts.csv"
        a.click()
      }
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
