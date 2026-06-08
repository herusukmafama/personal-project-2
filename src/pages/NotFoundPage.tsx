import { Link } from 'react-router-dom'
import { usePreferences } from '../i18n/preferencesContext'

export function NotFoundPage() {
  const { t } = usePreferences()

  return (
    <div className="grid min-h-[65vh] place-items-center text-center">
      <div>
        <p className="text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{t('pageNotFound')}</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">{t('pageNotFoundDescription')}</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {t('returnToDashboard')}
        </Link>
      </div>
    </div>
  )
}
