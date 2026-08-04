import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createBanner,
  updateBanner,
  changeBannerStatus,
  deleteBanner,
  exportBannersCSV,
} from "../requests/banners"
import { GET_BANNERS_KEY, GET_BANNER_BY_ID_KEY } from "../query-keys"
import { showAlert } from "@/store/alerts"

export const useCreateBanner = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_BANNERS_KEY] })
      showAlert({ variant: "success", message: "Banner created successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useUpdateBanner = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateBanner>[1] }) =>
      updateBanner(id, payload),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [GET_BANNERS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_BANNER_BY_ID_KEY, id] })
      showAlert({ variant: "success", message: "Banner updated successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useChangeBannerStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Parameters<typeof changeBannerStatus>[1]
    }) => changeBannerStatus(id, payload),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [GET_BANNERS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_BANNER_BY_ID_KEY, id] })
      showAlert({ variant: "success", message: "Banner status updated" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useDeleteBanner = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_BANNERS_KEY] })
      showAlert({ variant: "success", message: "Banner deleted" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useExportBannersCSV = () =>
  useMutation({
    mutationFn: exportBannersCSV,
    onSuccess: (data) => {
      if (data.url) {
        const a = document.createElement("a")
        a.href = data.url
        a.download = "banners.csv"
        a.click()
      }
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
