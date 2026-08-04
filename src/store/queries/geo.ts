import { useQuery } from "@tanstack/react-query"
import { getCountries, getStates, getLgas } from "../requests/geo"
import { GET_GEO_COUNTRIES_KEY, GET_GEO_STATES_KEY, GET_GEO_LGAS_KEY } from "../query-keys"

export const useGetCountries = () => {
  return useQuery({
    queryKey: [GET_GEO_COUNTRIES_KEY],
    queryFn: () => getCountries(),
  })
}

export const useGetStates = (countryCode: string) => {
  return useQuery({
    queryKey: [GET_GEO_STATES_KEY, countryCode],
    queryFn: () => getStates(countryCode),
    enabled: !!countryCode,
  })
}

export const useGetLgas = (stateId: number | null) => {
  return useQuery({
    queryKey: [GET_GEO_LGAS_KEY, stateId],
    queryFn: () => getLgas(stateId!),
    enabled: stateId !== null,
  })
}
