import changelogMarkdown from '../../CHANGELOGS.md?raw'
import { PageHeader } from '../components/PageHeader'
import { usePreferences } from '../i18n/preferencesContext'
import { parseChangelogMarkdown } from './changelogParser'

const changelogEntries = parseChangelogMarkdown(changelogMarkdown)

export function ChangelogPage() {
  const { t } = usePreferences()

  return (
    <div>
      <PageHeader
        eyebrow={t('changelogEyebrow')}
        title={t('changelogTitle')}
        description={t('changelogDescription')}
      />

      <p className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        {t('changelogStaticNote')}
      </p>

      <section className="mt-8 space-y-4">
        {changelogEntries.map((entry) => (
          <article
            key={`${entry.date}-${entry.title}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                  {entry.date}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  {entry.title}
                </h2>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {entry.description}
            </p>
            {entry.items.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {entry.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 rounded-full bg-brand-500"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}
