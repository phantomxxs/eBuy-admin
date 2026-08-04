import { useMutation, useQueryClient } from "@tanstack/react-query"
import { showAlert } from "@/store/alerts"
import {
  changeVoucherStatus,
  createVoucher,
  deleteVoucher,
  generateVoucherCode,
  updateVoucher,
} from "../requests/vouchers"
import { GET_VOUCHERS_KEY, GET_VOUCHER_BY_ID_KEY } from "../query-keys"

export const useCreateVoucher = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVoucher,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_VOUCHERS_KEY] })
      showAlert({ variant: "success", message: "Voucher created successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useUpdateVoucher = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateVoucher>[1] }) =>
      updateVoucher(id, payload),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [GET_VOUCHERS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_VOUCHER_BY_ID_KEY, id] })
      showAlert({ variant: "success", message: "Voucher updated successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useToggleVoucherStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      changeVoucherStatus(id, status),
    onSuccess: (_, { id, status }) => {
      void qc.invalidateQueries({ queryKey: [GET_VOUCHERS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_VOUCHER_BY_ID_KEY, id] })
      const label = status === "active" ? "activated" : "deactivated"
      showAlert({ variant: "success", message: `Voucher ${label} successfully` })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useDeleteVoucher = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVoucher(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_VOUCHERS_KEY] })
      showAlert({ variant: "success", message: "Voucher deleted successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useGenerateVoucherCode = () => useMutation({ mutationFn: generateVoucherCode })
