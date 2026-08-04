export interface Country {
  code: string
  name: string
}

export interface State {
  state_id: number
  name: string
  capital: string
  code: string
}

export interface Lga {
  lga_id: number
  name: string
}

export interface GeoOption {
  label: string
  value: string
}

export interface GeoOptions {
  countryOptions: GeoOption[]
  stateOptions: GeoOption[]
  lgaOptions: GeoOption[]
}
