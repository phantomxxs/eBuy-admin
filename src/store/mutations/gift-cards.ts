import { useMutation, useQueryClient } from "@tanstack/react-query"
import { showAlert } from "@/store/alerts"
import {
  changeGiftCardStatus,
  deleteGiftCard,
  exportGiftCardsCSV,
  resendGiftCardEmail,
  exportGiftCardLedger,
} from "../requests/gift-cards"
import { GET_GIFT_CARDS_KEY, GET_GIFT_CARD_BY_ID_KEY } from "../query-keys"
import type { ChangeGiftCardStatusPayload, GetGiftCardsParams } from "@/types/gift-cards"

export const useChangeGiftCardStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangeGiftCardStatusPayload }) =>
      changeGiftCardStatus(id, payload),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [GET_GIFT_CARDS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_GIFT_CARD_BY_ID_KEY, id] })
      showAlert({ variant: "success", message: "Gift card status updated" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useDeleteGiftCard = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGiftCard(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_GIFT_CARDS_KEY] })
      showAlert({ variant: "success", message: "Gift card deleted successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useExportGiftCardsCSV = () =>
  useMutation({
    mutationFn: (params: GetGiftCardsParams = {}) => exportGiftCardsCSV(params),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })

export const useResendGiftCardEmail = () =>
  useMutation({
    mutationFn: (id: string) => resendGiftCardEmail(id),
    onSuccess: () =>
      showAlert({ variant: "success", message: "Gift card email resent successfully" }),
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })

export const useExportGiftCardLedger = () =>
  useMutation({
    mutationFn: (id: string) => exportGiftCardLedger(id),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
