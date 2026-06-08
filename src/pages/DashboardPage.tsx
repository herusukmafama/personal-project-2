import { Link } from 'react-router-dom'
import { ArrowIcon, CalculatorIcon, DatabaseIcon, FileCodeIcon, ShieldIcon } from '../components/Icons'
import { PageHeader } from '../components/PageHeader'
import { usePreferences } from '../i18n/preferencesContext'

export function DashboardPage() {
  const { t } = usePreferences()

  return (
    <div>
      <PageHeader
        eyebrow={t('dashboardEyebrow')}
        title={t('dashboardTitle')}
        description={t('dashboardDescription')}
      />

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('availableTools')}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('startBelow')}</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
            {t('toolCount')}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Link
            to="/tools/docx-to-json"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-brand-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <FileCodeIcon className="size-6" />
              </div>
              <ArrowIcon className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{t('docxToJson')}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {t('docxDescription')}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <ShieldIcon className="size-4" />
              {t('browserOnly')}
            </div>
          </Link>

          <Link
            to="/tools/sql-deployment-formatter"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-brand-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="grid size-12 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <DatabaseIcon className="size-6" />
              </div>
              <ArrowIcon className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">SQL Deployment Formatter</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {t('sqlDescription')}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <ShieldIcon className="size-4" />
              {t('browserOnly')}
            </div>
          </Link>

          <Link
            to="/tools/installment-simulator"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-brand-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="grid size-12 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <CalculatorIcon className="size-6" />
              </div>
              <ArrowIcon className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{t('installmentSimulator')}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {t('installmentDescription')}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <ShieldIcon className="size-4" />
              {t('browserOnly')}
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
