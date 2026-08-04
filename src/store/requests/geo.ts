import instance from "@/services/axios-instance"
import { GEO_COUNTRIES, GEO_STATES, GEO_LGAS } from "@/services/apis"
import type { Country, State, Lga } from "@/types/geo"

export const getCountries = async (): Promise<Country[]> => {
  const response = await instance.get<Country[]>(GEO_COUNTRIES)
  return response.data
}

export const getStates = async (countryCode: string): Promise<State[]> => {
  const response = await instance.get<State[]>(GEO_STATES(countryCode))
  return response.data
}

export const getLgas = async (stateId: number): Promise<Lga[]> => {
  const response = await instance.get<Lga[]>(GEO_LGAS(stateId))
  return response.data
}
