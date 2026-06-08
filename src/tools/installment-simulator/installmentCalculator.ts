import type {
  EffectiveSimulationInput,
  FlatSimulationInput,
  InstallmentRow,
  InstallmentSimulationResult,
} from './types'

const FINANCIAL_MAX_ITERATIONS = 128
const FINANCIAL_PRECISION = 0.0000001

export function formatCurrencyValue(value: number) {
  if (!Number.isFinite(value)) return '0'
  return Math.round(value).toLocaleString('en-US')
}

export function parseCurrencyValue(value: string) {
  const parsed = Number(value.replace(/[^0-9.]+/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function calculateEffectiveSimulation(
  input: EffectiveSimulationInput,
): InstallmentSimulationResult {
  const monthlyRate = input.effectiveRateYear / 12
  const monthlyRateDecimal = monthlyRate / 100
  const installmentPerMonth = calculateAnnuityInstallment(
    input.plafond,
    input.periodMonths,
    monthlyRateDecimal,
  )

  return {
    mode: 'effective',
    plafond: input.plafond,
    months: input.periodMonths,
    installmentPerMonth,
    effectiveRateMonth: monthlyRate,
    effectiveRateYear: input.effectiveRateYear,
    schedule: buildInstallmentSchedule({
      plafond: input.plafond,
      months: input.periodMonths,
      installmentPerMonth,
      effectiveRateMonth: monthlyRate,
    }),
  }
}

export function calculateFlatSimulation(
  input: FlatSimulationInput,
): InstallmentSimulationResult {
  const flatRateYear = input.flatRateMonth * 12
  const installmentPerMonth = Math.ceil(
    input.plafond / input.tenorMonths + (input.flatRateMonth / 100) * input.plafond,
  )
  const effectiveRateMonth = getRate(
    input.tenorMonths,
    installmentPerMonth,
    input.plafond * -1,
  ) * 100
  const effectiveRateYear = effectiveRateMonth * 12

  return {
    mode: 'flat',
    plafond: input.plafond,
    months: input.tenorMonths,
    installmentPerMonth,
    effectiveRateMonth,
    effectiveRateYear,
    flatRateMonth: input.flatRateMonth,
    flatRateYear,
    schedule: buildInstallmentSchedule({
      plafond: input.plafond,
      months: input.tenorMonths,
      installmentPerMonth,
      effectiveRateMonth,
    }),
  }
}

function calculateAnnuityInstallment(
  plafond: number,
  months: number,
  monthlyRateDecimal: number,
) {
  if (monthlyRateDecimal === 0) return Math.ceil(plafond / months)
  const denominator = 1 - (1 + monthlyRateDecimal) ** (months * -1)
  return Math.ceil((plafond * monthlyRateDecimal) / denominator)
}

function buildInstallmentSchedule({
  plafond,
  months,
  installmentPerMonth,
  effectiveRateMonth,
}: {
  plafond: number
  months: number
  installmentPerMonth: number
  effectiveRateMonth: number
}): InstallmentRow[] {
  const rows: InstallmentRow[] = []
  let residual = plafond

  for (let month = 1; month <= months; month += 1) {
    const interest = Math.ceil((effectiveRateMonth / 100) * residual)
    const isLastMonth = month === months
    const principal = isLastMonth ? residual : installmentPerMonth - interest
    const installment = isLastMonth ? interest + principal : installmentPerMonth
    residual -= principal

    rows.push({
      month,
      installment,
      interest,
      principal,
      residualPrincipal: residual,
    })
  }

  return rows
}

function getRate(
  paymentsPerYear: number,
  paymentAmount: number,
  presentValue: number,
  futureValue = 0,
  dueEndOrBeginning = 0,
  interest = 0.01,
) {
  let y: number
  let y0: number
  let y1: number
  let x0: number
  let x1 = 0
  let f = 0
  let i = 0
  let rate = interest

  if (Math.abs(rate) < FINANCIAL_PRECISION) {
    y = presentValue * (1 + paymentsPerYear * rate)
      + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear
      + futureValue
  } else {
    f = Math.exp(paymentsPerYear * Math.log(1 + rate))
    y = presentValue * f
      + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1)
      + futureValue
  }

  y0 = presentValue + paymentAmount * paymentsPerYear + futureValue
  y1 = y
  x0 = 0
  x1 = rate

  while (Math.abs(y0 - y1) > FINANCIAL_PRECISION && i < FINANCIAL_MAX_ITERATIONS) {
    rate = (y1 * x0 - y0 * x1) / (y1 - y0)
    x0 = x1
    x1 = rate

    if (Math.abs(rate) < FINANCIAL_PRECISION) {
      y = presentValue * (1 + paymentsPerYear * rate)
        + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear
        + futureValue
    } else {
      f = Math.exp(paymentsPerYear * Math.log(1 + rate))
      y = presentValue * f
        + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1)
        + futureValue
    }

    y0 = y1
    y1 = y
    i += 1
  }

  return rate
}
