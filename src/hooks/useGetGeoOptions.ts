import { useGetCountries, useGetLgas, useGetStates } from "@/store/queries/geo"
import type { Country, GeoOption, Lga, State } from "@/types/geo"
import { useMemo } from "react"

export interface UseGetGeoOptionsProps {
  selectedCountryCode?: string
  selectedStateId?: number | null
}

export interface UseGetGeoOptionsReturn {
  countryOptions: GeoOption[]
  stateOptions: GeoOption[]
  lgaOptions: GeoOption[]
  isLoadingCountries: boolean
  isLoadingStates: boolean
  isLoadingLgas: boolean
  isErrorCountries: boolean
  isErrorStates: boolean
  isErrorLgas: boolean
}

export const useGetGeoOptions = (props: UseGetGeoOptionsProps = {}): UseGetGeoOptionsReturn => {
  const { selectedCountryCode, selectedStateId } = props

  // Fetch countries
  const {
    data: countries,
    isLoading: isLoadingCountries,
    isError: isErrorCountries,
  } = useGetCountries()

  // Fetch states based on selected country
  const {
    data: states,
    isLoading: isLoadingStates,
    isError: isErrorStates,
  } = useGetStates(selectedCountryCode || "")

  // Fetch LGAs based on selected state
  const {
    data: lgas,
    isLoading: isLoadingLgas,
    isError: isErrorLgas,
  } = useGetLgas(selectedStateId || null)

  // Transform countries to options format
  const countryOptions: GeoOption[] = useMemo(() => {
    if (!countries) return []
    return countries.map((country: Country) => ({
      label: country.name,
      value: country.code,
    }))
  }, [countries])

  // Transform states to options format
  const stateOptions: GeoOption[] = useMemo(() => {
    if (!states) return []
    return states.map((state: State) => ({
      label: state.name,
      value: String(state.state_id),
    }))
  }, [states])

  // Transform LGAs to options format
  const lgaOptions: GeoOption[] = useMemo(() => {
    if (!lgas) return []
    return lgas.map((lga: Lga) => ({
      label: lga.name,
      value: String(lga.lga_id),
    }))
  }, [lgas])

  return {
    countryOptions,
    stateOptions,
    lgaOptions,
    isLoadingCountries,
    isLoadingStates,
    isLoadingLgas,
    isErrorCountries,
    isErrorStates,
    isErrorLgas,
  }
}
