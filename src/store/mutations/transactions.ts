import { useMutation } from "@tanstack/react-query"
import { exportTransactionsCSV, getTransactionReceipt } from "../requests/transactions"

export const useExportTransactionsCSV = () =>
  useMutation({
    mutationFn: () => exportTransactionsCSV(),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })

export const useDownloadTransactionReceipt = () =>
  useMutation({
    mutationFn: (ref: string) => getTransactionReceipt(ref),
    onSuccess: ({ download_url }) => {
      window.open(download_url, "_blank", "noopener,noreferrer")
    },
  })
