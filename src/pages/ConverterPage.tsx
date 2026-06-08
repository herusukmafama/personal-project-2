import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { usePreferences } from '../i18n/preferencesContext'
import { DocxToJsonTool } from '../tools/docx-to-json/DocxToJsonTool'

export function ConverterPage() {
  const { t } = usePreferences()

  return (
    <div>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
      >
        <span aria-hidden="true">&larr;</span>
        {t('backToDashboard')}
      </Link>

      <PageHeader
        eyebrow={t('converterEyebrow')}
        title={t('converterTitle')}
        description={t('converterDescription')}
      />

      <DocxToJsonTool />
    </div>
  )
}
