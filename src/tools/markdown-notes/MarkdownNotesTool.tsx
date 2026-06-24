import { useEffect, useMemo, useRef, useState } from 'react'
import { usePreferences } from '../../i18n/preferencesContext'
import { downloadMarkdown } from './downloadMarkdown'
import { generateMarkdown, generateMarkdownFileName } from './generateMarkdown'
import { parseMarkdownPreview } from './renderMarkdown'
import { clearDraft, loadDraft, saveDraft } from './storage'
import { emptyMarkdownNotesInput, type MarkdownNotesInput, type MarkdownPreviewBlock } from './types'

type FieldConfig = {
  key: keyof MarkdownNotesInput
  labelKey:
    | 'markdownTitleField'
    | 'markdownSummaryField'
    | 'markdownMrLinkField'
    | 'markdownAppsettingField'
    | 'markdownDbNameField'
    | 'markdownBackupScriptField'
    | 'markdownDeploymentScriptField'
    | 'markdownVerificationQueryField'
    | 'markdownRollbackQueryField'
    | 'markdownNotesField'
  multiline?: boolean
  code?: boolean
  placeholder?: string
}

const fields: FieldConfig[] = [
  { key: 'title', labelKey: 'markdownTitleField', placeholder: 'Workflow PIC Internal Notification' },
  { key: 'summary', labelKey: 'markdownSummaryField', multiline: true },
  { key: 'mrLink', labelKey: 'markdownMrLinkField', placeholder: 'https://github.com/org/repo/pull/123' },
  { key: 'appsetting', labelKey: 'markdownAppsettingField', multiline: true, code: true },
  { key: 'dbName', labelKey: 'markdownDbNameField', placeholder: 'idc-collection-v2' },
  { key: 'backupScript', labelKey: 'markdownBackupScriptField', multiline: true, code: true },
  { key: 'deploymentScript', labelKey: 'markdownDeploymentScriptField', multiline: true, code: true },
  { key: 'verificationQuery', labelKey: 'markdownVerificationQueryField', multiline: true, code: true },
  { key: 'rollbackQuery', labelKey: 'markdownRollbackQueryField', multiline: true, code: true },
  { key: 'notes', labelKey: 'markdownNotesField', multiline: true },
]

function MarkdownPreviewBlockView({ block }: { block: MarkdownPreviewBlock }) {
  if (block.type === 'divider') {
    return <hr className="my-5 border-slate-200 dark:border-slate-700" />
  }

  if (block.type === 'code') {
    return (
      <div className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700">
        <div className="border-b border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {block.language || 'code'}
        </div>
        <pre className="max-h-72 overflow-auto p-4 text-sm leading-6 text-slate-100">
          <code>{block.content || ' '}</code>
        </pre>
      </div>
    )
  }

  if (block.type === 'heading') {
    const className =
      block.level === 1
        ? 'text-2xl font-semibold tracking-tight text-slate-950 dark:text-white'
        : block.level === 2
          ? 'mt-6 text-lg font-semibold text-slate-900 dark:text-white'
          : 'mt-4 text-base font-semibold text-slate-800 dark:text-slate-100'

    const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3'
    return <HeadingTag className={className}>{block.text || ' '}</HeadingTag>
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
      {block.text || ' '}
    </p>
  )
}

export function MarkdownNotesTool() {
  const { t } = usePreferences()
  const [formData, setFormData] = useState<MarkdownNotesInput>(() => loadDraft() ?? emptyMarkdownNotesInput)
  const [previewMode, setPreviewMode] = useState<'rendered' | 'raw'>('rendered')
  const [statusMessage, setStatusMessage] = useState('')
  const skipNextDraftSave = useRef(false)

  const markdown = useMemo(() => generateMarkdown(formData), [formData])
  const previewBlocks = useMemo(() => parseMarkdownPreview(markdown), [markdown])
  const filename = useMemo(() => generateMarkdownFileName(formData.title), [formData.title])

  useEffect(() => {
    if (skipNextDraftSave.current) {
      skipNextDraftSave.current = false
      return
    }

    try {
      saveDraft(formData)
      setStatusMessage(t('markdownDraftSaved'))
    } catch {
      setStatusMessage(t('markdownDraftSaveFailed'))
    }
  }, [formData, t])

  function updateField(key: keyof MarkdownNotesInput, value: string) {
    setFormData((currentValue) => ({ ...currentValue, [key]: value }))
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown)
      setStatusMessage(t('markdownCopied'))
    } catch {
      setStatusMessage(t('copyFailed'))
    }
  }

  function downloadGeneratedMarkdown() {
    try {
      downloadMarkdown(markdown, filename)
      setStatusMessage(t('markdownDownloaded'))
    } catch {
      setStatusMessage(t('markdownDownloadFailed'))
    }
  }

  function clearForm() {
    skipNextDraftSave.current = true
    setFormData(emptyMarkdownNotesInput)
    clearDraft()
    setStatusMessage(t('markdownDraftCleared'))
  }

  return (
    <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('markdownFormTitle')}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t('markdownFormDescription')}
          </p>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t(field.labelKey)}
              </span>
              {field.multiline ? (
                <textarea
                  value={formData[field.key]}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  rows={field.code ? 5 : 4}
                  className={`mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/30 ${
                    field.code ? 'font-mono' : ''
                  }`}
                />
              ) : (
                <input
                  value={formData[field.key]}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/30"
                />
              )}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('markdownPreviewTitle')}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t('markdownPreviewDescription')}
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {statusMessage || t('markdownDraftReady')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyMarkdown}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {t('markdownCopy')}
            </button>
            <button
              type="button"
              onClick={downloadGeneratedMarkdown}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('markdownDownload')}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
            >
              {t('markdownClear')}
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setPreviewMode('rendered')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                previewMode === 'rendered'
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-100'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t('markdownRendered')}
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('raw')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                previewMode === 'raw'
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-100'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t('markdownRaw')}
            </button>
          </div>
          <span className="hidden truncate text-xs text-slate-400 sm:block">{filename}</span>
        </div>

        {previewMode === 'rendered' ? (
          <div className="mt-5 min-h-[36rem] rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="space-y-3">
              {previewBlocks.map((block, index) => (
                <MarkdownPreviewBlockView key={`${block.type}-${index}`} block={block} />
              ))}
            </div>
          </div>
        ) : (
          <pre className="mt-5 min-h-[36rem] overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-5 text-sm leading-6 text-slate-100 dark:border-slate-800">
            <code>{markdown}</code>
          </pre>
        )}
      </section>
    </div>
  )
}
