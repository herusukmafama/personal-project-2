export type SimulationMode = 'effective' | 'flat'

export type EffectiveSimulationInput = {
  plafond: number
  periodMonths: number
  effectiveRateYear: number
}

export type FlatSimulationInput = {
  plafond: number
  tenorMonths: number
  flatRateMonth: number
}

export type InstallmentRow = {
  month: number
  installment: number
  interest: number
  principal: number
  residualPrincipal: number
}

export type InstallmentSimulationResult = {
  mode: SimulationMode
  plafond: number
  months: number
  installmentPerMonth: number
  effectiveRateMonth: number
  effectiveRateYear: number
  flatRateMonth?: number
  flatRateYear?: number
  schedule: InstallmentRow[]
}
