import { describe, expect, it } from 'vitest'
import {
  calculateEffectiveSimulation,
  calculateFlatSimulation,
  formatCurrencyValue,
  parseCurrencyValue,
} from './installmentCalculator'

describe('installment simulator', () => {
  it('calculates effective-rate annuity installment and schedule', () => {
    const result = calculateEffectiveSimulation({
      plafond: 10_000_000,
      periodMonths: 12,
      effectiveRateYear: 12,
    })

    expect(result.effectiveRateMonth).toBe(1)
    expect(result.installmentPerMonth).toBe(888_488)
    expect(result.schedule).toHaveLength(12)
    expect(result.schedule[0]).toMatchObject({
      month: 1,
      installment: 888_488,
      interest: 100_000,
      principal: 788_488,
      residualPrincipal: 9_211_512,
    })
    expect(result.schedule.at(-1)?.residualPrincipal).toBe(0)
  })

  it('calculates flat-rate installment and inferred effective rate', () => {
    const result = calculateFlatSimulation({
      plafond: 10_000_000,
      tenorMonths: 12,
      flatRateMonth: 1,
    })

    expect(result.flatRateYear).toBe(12)
    expect(result.installmentPerMonth).toBe(933_334)
    expect(result.effectiveRateMonth).toBeGreaterThan(1.7)
    expect(result.effectiveRateMonth).toBeLessThan(1.9)
    expect(result.schedule).toHaveLength(12)
    expect(result.schedule.at(-1)?.residualPrincipal).toBe(0)
  })

  it('formats and parses currency values for user input', () => {
    expect(parseCurrencyValue('10,000,000')).toBe(10_000_000)
    expect(formatCurrencyValue(10_000_000)).toBe('10,000,000')
  })
})
