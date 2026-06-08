import { useMemo, useState } from 'react'
import { usePreferences } from '../../i18n/preferencesContext'
import type { Language } from '../../i18n/translations'
import {
  calculateEffectiveSimulation,
  calculateFlatSimulation,
  formatCurrencyValue,
  parseCurrencyValue,
} from './installmentCalculator'
import type { InstallmentSimulationResult, SimulationMode } from './types'

type CopyState = 'idle' | 'copied'

const defaultMode: SimulationMode = 'effective'

export function InstallmentSimulatorTool() {
  const { language } = usePreferences()
  const text = copy[language]
  const [mode, setMode] = useState<SimulationMode>(defaultMode)
  const [plafond, setPlafond] = useState('10,000,000')
  const [months, setMonths] = useState('12')
  const [effectiveRateYear, setEffectiveRateYear] = useState('12')
  const [flatRateMonth, setFlatRateMonth] = useState('1')
  const [copyState, setCopyState] = useState<CopyState>('idle')

  const numericPlafond = parseCurrencyValue(plafond)
  const numericMonths = Number(months)
  const numericEffectiveRateYear = Number(effectiveRateYear)
  const numericFlatRateMonth = Number(flatRateMonth)
  const canSimulate = numericPlafond > 0 && numericMonths > 0
    && Number.isFinite(numericMonths)
    && (mode === 'effective'
      ? Number.isFinite(numericEffectiveRateYear) && numericEffectiveRateYear >= 0
      : Number.isFinite(numericFlatRateMonth) && numericFlatRateMonth >= 0)

  const result = useMemo<InstallmentSimulationResult | null>(() => {
    if (!canSimulate) return null
    if (mode === 'effective') {
      return calculateEffectiveSimulation({
        plafond: numericPlafond,
        periodMonths: numericMonths,
        effectiveRateYear: numericEffectiveRateYear,
      })
    }
    return calculateFlatSimulation({
      plafond: numericPlafond,
      tenorMonths: numericMonths,
      flatRateMonth: numericFlatRateMonth,
    })
  }, [
    canSimulate,
    mode,
    numericEffectiveRateYear,
    numericFlatRateMonth,
    numericMonths,
    numericPlafond,
  ])

  function handlePlafondChange(value: string) {
    setPlafond(formatCurrencyValue(parseCurrencyValue(value)))
  }

  function reset() {
    setMode(defaultMode)
    setPlafond('10,000,000')
    setMonths('12')
    setEffectiveRateYear('12')
    setFlatRateMonth('1')
    setCopyState('idle')
  }

  async function copySummary() {
    if (!result) return
    await navigator.clipboard.writeText(buildSummary(result, language))
    setCopyState('copied')
  }

  return (
    <div className="mt-10 space-y-6">
      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <p className="text-sm font-semibold text-brand-600">Step 1</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {text.chooseModeTitle}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {text.chooseModeDescription}
            </p>
            <div className="mt-4 grid gap-3">
              <ModeButton
                active={mode === 'effective'}
                title={text.effectiveModeTitle}
                description={text.effectiveModeDescription}
                onClick={() => setMode('effective')}
              />
              <ModeButton
                active={mode === 'flat'}
                title={text.flatModeTitle}
                description={text.flatModeDescription}
                onClick={() => setMode('flat')}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <p className="text-sm font-semibold text-brand-600">Step 2</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {text.inputTitle}
            </h2>
            <div className="mt-4 space-y-4">
              <Field label={text.plafondLabel} hint={text.plafondHint}>
                <input
                  value={plafond}
                  onChange={(event) => handlePlafondChange(event.target.value)}
                  inputMode="numeric"
                  className="input-style"
                />
              </Field>
              <Field label={text.tenorLabel} hint={text.tenorHint}>
                <input
                  value={months}
                  onChange={(event) => setMonths(event.target.value)}
                  inputMode="numeric"
                  className="input-style"
                />
              </Field>
              {mode === 'effective' ? (
                <Field label={text.effectiveRateYearLabel} hint={text.rateHint}>
                  <input
                    value={effectiveRateYear}
                    onChange={(event) => setEffectiveRateYear(event.target.value)}
                    inputMode="decimal"
                    className="input-style"
                  />
                </Field>
              ) : (
                <Field label={text.flatRateMonthLabel} hint={text.flatRateHint}>
                  <input
                    value={flatRateMonth}
                    onChange={(event) => setFlatRateMonth(event.target.value)}
                    inputMode="decimal"
                    className="input-style"
                  />
                </Field>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={reset} className="button-secondary">
                {text.reset}
              </button>
              <button type="button" onClick={copySummary} disabled={!result} className="button-primary">
                {text.copySummary}
              </button>
            </div>
            {copyState === 'copied' ? (
              <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
                {text.summaryCopied}
              </p>
            ) : null}
          </section>
        </div>

        <section className="space-y-6">
          {result ? <ResultCards result={result} text={text} /> : <EmptyResult text={text} />}
          {result ? <ScheduleTable result={result} text={text} /> : null}
        </section>
      </section>
    </div>
  )
}

function ModeButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100'
          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-100 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800'
      }`}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </span>
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
      {children}
      <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
        {hint}
      </span>
    </label>
  )
}

function ResultCards({
  result,
  text,
}: {
  result: InstallmentSimulationResult
  text: ToolCopy
}) {
  const cards = [
    {
      label: text.monthlyInstallment,
      value: formatCurrencyValue(result.installmentPerMonth),
      helper: text.monthlyInstallmentHelper,
    },
    {
      label: text.effectiveRateMonth,
      value: `${formatPercent(result.effectiveRateMonth)}%`,
      helper: text.effectiveRateMonthHelper,
    },
    {
      label: text.effectiveRateYear,
      value: `${formatPercent(result.effectiveRateYear)}%`,
      helper: result.mode === 'flat'
        ? text.convertedRateHelper
        : text.inputRateHelper,
    },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">{text.resultEyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            {text.resultTitle}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {result.months} {text.months}
        </span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{card.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{card.helper}</p>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {text.disclaimer}
      </p>
    </section>
  )
}

function EmptyResult({ text }: { text: ToolCopy }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        {text.emptyTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {text.emptyDescription}
      </p>
    </section>
  )
}

function ScheduleTable({
  result,
  text,
}: {
  result: InstallmentSimulationResult
  text: ToolCopy
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">{text.scheduleTitle}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {text.scheduleDescription}
        </p>
      </div>
      <div className="max-h-[620px] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="sticky top-0 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">{text.monthColumn}</th>
              <th className="px-4 py-3 text-right">{text.installmentColumn}</th>
              <th className="px-4 py-3 text-right">{text.interestColumn}</th>
              <th className="px-4 py-3 text-right">{text.principalColumn}</th>
              <th className="px-4 py-3 text-right">{text.residualColumn}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {result.schedule.map((row) => (
              <tr key={row.month} className="text-slate-700 dark:text-slate-200">
                <td className="px-4 py-3 font-medium">{row.month}</td>
                <td className="px-4 py-3 text-right">{formatCurrencyValue(row.installment)}</td>
                <td className="px-4 py-3 text-right">{formatCurrencyValue(row.interest)}</td>
                <td className="px-4 py-3 text-right">{formatCurrencyValue(row.principal)}</td>
                <td className="px-4 py-3 text-right">{formatCurrencyValue(row.residualPrincipal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 6,
  })
}

function buildSummary(result: InstallmentSimulationResult, language: Language) {
  const text = copy[language]
  return [
    text.summaryTitle,
    '',
    `${text.summaryMode}: ${result.mode === 'effective' ? 'Anuitas - Effective Rate' : 'Anuitas - Flat Rate'}`,
    `Plafond: ${formatCurrencyValue(result.plafond)}`,
    `${text.summaryTenor}: ${result.months} ${text.months}`,
    result.mode === 'flat' ? `${text.flatRateMonthLabel}: ${formatPercent(result.flatRateMonth || 0)}%` : null,
    result.mode === 'flat' ? `${text.flatRateYear}: ${formatPercent(result.flatRateYear || 0)}%` : null,
    `${text.effectiveRateMonth}: ${formatPercent(result.effectiveRateMonth)}%`,
    `${text.effectiveRateYear}: ${formatPercent(result.effectiveRateYear)}%`,
    `${text.monthlyInstallment}: ${formatCurrencyValue(result.installmentPerMonth)}`,
  ].filter(Boolean).join('\n')
}

type ToolCopy = { [Key in keyof typeof copy.id]: string }

const copy = {
  id: {
    chooseModeTitle: 'Pilih cara simulasi',
    chooseModeDescription: 'Pilih jenis rate yang paling sesuai dengan informasi yang Anda punya.',
    effectiveModeTitle: 'Saya punya effective rate tahunan',
    effectiveModeDescription: 'Cocok jika rate yang diberikan sudah dalam bentuk efektif per tahun.',
    flatModeTitle: 'Saya punya flat rate bulanan',
    flatModeDescription: 'Cocok untuk simulasi flat rate, lalu tools akan bantu hitung effective rate.',
    inputTitle: 'Isi data pinjaman',
    plafondLabel: 'Jumlah pinjaman',
    plafondHint: 'Contoh: 10,000,000',
    tenorLabel: 'Tenor',
    tenorHint: 'Jumlah bulan angsuran',
    effectiveRateYearLabel: 'Effective rate per tahun',
    flatRateMonthLabel: 'Flat rate per bulan',
    flatRateYear: 'Flat rate per tahun',
    rateHint: 'Masukkan angka persen, contoh: 12',
    flatRateHint: 'Masukkan angka persen, contoh: 1',
    reset: 'Reset',
    copySummary: 'Copy ringkasan',
    summaryCopied: 'Ringkasan berhasil disalin.',
    monthlyInstallment: 'Angsuran per bulan',
    monthlyInstallmentHelper: 'Estimasi nominal yang dibayar setiap bulan.',
    effectiveRateMonth: 'Effective rate per bulan',
    effectiveRateMonthHelper: 'Rate bulanan yang dipakai untuk jadwal angsuran.',
    effectiveRateYear: 'Effective rate per tahun',
    convertedRateHelper: 'Hasil konversi dari flat rate.',
    inputRateHelper: 'Sesuai input effective rate tahunan.',
    resultEyebrow: 'Hasil simulasi',
    resultTitle: 'Gambaran angsuran ARJUNA',
    months: 'bulan',
    disclaimer: 'Simulasi ini membantu membaca estimasi. Tetap gunakan kebijakan resmi tim untuk keputusan final.',
    emptyTitle: 'Masukkan data untuk melihat simulasi',
    emptyDescription: 'Hasil akan muncul otomatis setelah jumlah pinjaman, tenor, dan rate diisi dengan benar.',
    scheduleTitle: 'Jadwal angsuran',
    scheduleDescription: 'Tabel ini menunjukkan perkiraan bunga, pokok, dan sisa pokok setiap bulan.',
    monthColumn: 'Bulan',
    installmentColumn: 'Angsuran',
    interestColumn: 'Bunga',
    principalColumn: 'Pokok',
    residualColumn: 'Sisa pokok',
    summaryTitle: 'Simulasi Angsuran ARJUNA',
    summaryMode: 'Jenis simulasi',
    summaryTenor: 'Tenor',
  },
  en: {
    chooseModeTitle: 'Choose simulation method',
    chooseModeDescription: 'Pick the rate type that matches the information you have.',
    effectiveModeTitle: 'I have yearly effective rate',
    effectiveModeDescription: 'Use this when the rate is already provided as yearly effective rate.',
    flatModeTitle: 'I have monthly flat rate',
    flatModeDescription: 'Use this for flat-rate input. The tool will estimate the effective rate.',
    inputTitle: 'Enter loan details',
    plafondLabel: 'Loan amount',
    plafondHint: 'Example: 10,000,000',
    tenorLabel: 'Tenor',
    tenorHint: 'Number of installment months',
    effectiveRateYearLabel: 'Effective rate per year',
    flatRateMonthLabel: 'Flat rate per month',
    flatRateYear: 'Flat rate per year',
    rateHint: 'Enter percentage, example: 12',
    flatRateHint: 'Enter percentage, example: 1',
    reset: 'Reset',
    copySummary: 'Copy summary',
    summaryCopied: 'Summary copied.',
    monthlyInstallment: 'Monthly installment',
    monthlyInstallmentHelper: 'Estimated amount paid each month.',
    effectiveRateMonth: 'Effective rate per month',
    effectiveRateMonthHelper: 'Monthly rate used for the installment schedule.',
    effectiveRateYear: 'Effective rate per year',
    convertedRateHelper: 'Converted from flat rate.',
    inputRateHelper: 'Based on the yearly effective rate input.',
    resultEyebrow: 'Simulation result',
    resultTitle: 'ARJUNA installment overview',
    months: 'months',
    disclaimer: 'This simulation helps estimate the numbers. Please follow the official team policy for final decisions.',
    emptyTitle: 'Enter details to see the simulation',
    emptyDescription: 'Results appear automatically after loan amount, tenor, and rate are filled correctly.',
    scheduleTitle: 'Installment schedule',
    scheduleDescription: 'This table shows estimated interest, principal, and remaining principal each month.',
    monthColumn: 'Month',
    installmentColumn: 'Installment',
    interestColumn: 'Interest',
    principalColumn: 'Principal',
    residualColumn: 'Remaining principal',
    summaryTitle: 'ARJUNA Installment Simulation',
    summaryMode: 'Simulation type',
    summaryTenor: 'Tenor',
  },
} as const
