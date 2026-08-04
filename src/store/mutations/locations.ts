import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createLocation,
  updateLocation,
  deleteLocation,
  exportLocationsCSV,
  validateShipbubbleAddress,
} from "@/store/requests/locations"
import { GET_LOCATIONS_KEY, GET_LOCATION_BY_ID_KEY } from "@/store/query-keys"
import type { CreateLocationPayload } from "@/types/locations"

export const useCreateLocation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_LOCATIONS_KEY] }),
  })
}

export const useUpdateLocation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & CreateLocationPayload) =>
      updateLocation(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [GET_LOCATIONS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_LOCATION_BY_ID_KEY, id] })
    },
  })
}

export const useDeleteLocation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_LOCATIONS_KEY] }),
  })
}

export const useExportLocationsCSV = () =>
  useMutation({
    mutationFn: () => exportLocationsCSV(),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })

export const useValidateShipbubbleAddress = () =>
  useMutation({
    mutationFn: (id: string) => validateShipbubbleAddress(id),
  })
