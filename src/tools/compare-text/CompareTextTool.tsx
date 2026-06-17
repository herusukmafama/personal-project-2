import { type ChangeEvent, useMemo, useRef, useState } from 'react'
import { FileCodeIcon, ShieldIcon, UploadIcon } from '../../components/Icons'
import { usePreferences } from '../../i18n/preferencesContext'
import { buildDiffSummaryText, compareText } from './compareText'
import { detectTextType } from './detectTextType'
import { readTextLikeFile } from './fileReader'
import { normalizeTextForCompare } from './normalizeText'
import type { CompareOptions, DetectedTextType, DiffLine } from './types'

type MessageType = 'neutral' | 'error' | 'success' | 'warning'
type DiffView = 'side-by-side' | 'unified'

const defaultOptions: CompareOptions = {
  ignoreWhitespace: false,
  ignoreCase: false,
  trimLineEndings: true,
  showOnlyChanges: false,
}

const typeLabels: Record<DetectedTextType, string> = {
  sql: 'SQL',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  markdown: 'Markdown',
  csv: 'CSV',
  tsv: 'TSV',
  plain: 'Plain text',
}

export function CompareTextTool() {
  const { t } = usePreferences()
  const leftFileRef = useRef<HTMLInputElement>(null)
  const rightFileRef = useRef<HTMLInputElement>(null)
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [leftFileName, setLeftFileName] = useState('')
  const [rightFileName, setRightFileName] = useState('')
  const [options, setOptions] = useState<CompareOptions>(defaultOptions)
  const [view, setView] = useState<DiffView>('side-by-side')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('neutral')

  const leftType = useMemo(() => detectTextType(leftText), [leftText])
  const rightType = useMemo(() => detectTextType(rightText), [rightText])
  const result = useMemo(
    () => compareText(leftText, rightText, options),
    [leftText, options, rightText],
  )
  const hasContent = Boolean(leftText || rightText)
  const typeMismatch = leftText && rightText && leftType !== rightType

  function showMessage(value: string, type: MessageType) {
    setMessage(value)
    setMessageType(type)
  }

  async function handleFile(
    event: ChangeEvent<HTMLInputElement>,
    side: 'left' | 'right',
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await readTextLikeFile(file)

      if (side === 'left') {
        setLeftText(text)
        setLeftFileName(file.name)
      } else {
        setRightText(text)
        setRightFileName(file.name)
      }

      showMessage(`${t('compareFileLoaded')} ${file.name}.`, 'success')
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : t('compareFileReadFailed'),
        'error',
      )
    }
  }

  function normalizeSide(side: 'left' | 'right') {
    const text = side === 'left' ? leftText : rightText
    const type = side === 'left' ? leftType : rightType

    try {
      const normalized = normalizeTextForCompare(text, type)

      if (side === 'left') {
        setLeftText(normalized.value)
      } else {
        setRightText(normalized.value)
      }

      showMessage(
        normalized.changed ? t('compareNormalized') : t('compareAlreadyClean'),
        'success',
      )
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : t('compareNormalizeFailed'),
        'error',
      )
    }
  }

  function swapSides() {
    setLeftText(rightText)
    setRightText(leftText)
    setLeftFileName(rightFileName)
    setRightFileName(leftFileName)
  }

  function clearBoth() {
    setLeftText('')
    setRightText('')
    setLeftFileName('')
    setRightFileName('')
    setMessage('')

    if (leftFileRef.current) {
      leftFileRef.current.value = ''
    }

    if (rightFileRef.current) {
      rightFileRef.current.value = ''
    }
  }

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value)
      showMessage(successMessage, 'success')
    } catch {
      showMessage(t('copyFailed'), 'error')
    }
  }

  const messageClasses = {
    neutral:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
    error:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
    warning:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
  }

  return (
    <section className="mt-10 space-y-6">
      <section className="grid gap-5 xl:grid-cols-2">
        <TextInputPanel
          title={t('compareLeftText')}
          value={leftText}
          fileName={leftFileName}
          detectedType={leftType}
          fileInputRef={leftFileRef}
          onChange={setLeftText}
          onFileChange={(event) => handleFile(event, 'left')}
          onNormalize={() => normalizeSide('left')}
        />
        <TextInputPanel
          title={t('compareRightText')}
          value={rightText}
          fileName={rightFileName}
          detectedType={rightType}
          fileInputRef={rightFileRef}
          onChange={setRightText}
          onFileChange={(event) => handleFile(event, 'right')}
          onNormalize={() => normalizeSide('right')}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('compareOptions')}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t('compareOptionsDescription')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={swapSides} className="button-secondary">
              {t('compareSwap')}
            </button>
            <button type="button" onClick={clearBoth} className="button-secondary">
              {t('compareClear')}
            </button>
            <button
              type="button"
              disabled={!hasContent}
              onClick={() =>
                copyText(buildDiffSummaryText(result.summary), t('compareSummaryCopied'))
              }
              className="button-secondary"
            >
              {t('compareCopySummary')}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <CheckboxOption
            label={t('compareIgnoreWhitespace')}
            checked={options.ignoreWhitespace}
            onChange={(checked) =>
              setOptions((current) => ({ ...current, ignoreWhitespace: checked }))
            }
          />
          <CheckboxOption
            label={t('compareIgnoreCase')}
            checked={options.ignoreCase}
            onChange={(checked) =>
              setOptions((current) => ({ ...current, ignoreCase: checked }))
            }
          />
          <CheckboxOption
            label={t('compareTrimLineEndings')}
            checked={options.trimLineEndings}
            onChange={(checked) =>
              setOptions((current) => ({ ...current, trimLineEndings: checked }))
            }
          />
          <CheckboxOption
            label={t('compareShowOnlyChanges')}
            checked={options.showOnlyChanges}
            onChange={(checked) =>
              setOptions((current) => ({ ...current, showOnlyChanges: checked }))
            }
          />
        </div>

        {typeMismatch && (
          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${messageClasses.warning}`}>
            {t('compareTypeMismatch')} {typeLabels[leftType]} vs {typeLabels[rightType]}.
          </div>
        )}

        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${messageClasses[messageType]}`}
          >
            {message}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileCodeIcon className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{t('compareResult')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {result.summary.addedLines} {t('compareAdded')}, {result.summary.removedLines}{' '}
                {t('compareRemoved')}, {result.summary.changedBlocks}{' '}
                {t('compareChangedBlocks')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setView('side-by-side')}
              className={view === 'side-by-side' ? 'button-primary' : 'button-secondary'}
            >
              {t('sideBySide')}
            </button>
            <button
              type="button"
              onClick={() => setView('unified')}
              className={view === 'unified' ? 'button-primary' : 'button-secondary'}
            >
              {t('unified')}
            </button>
          </div>
        </div>
        {view === 'side-by-side' ? (
          <SideBySideDiff lines={result.lines} />
        ) : (
          <UnifiedDiff lines={result.lines} />
        )}
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
        <div className="flex gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldIcon className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('privateByDesign')}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t('comparePrivacy')}
            </p>
          </div>
        </div>
      </aside>
    </section>
  )
}

function TextInputPanel({
  title,
  value,
  fileName,
  detectedType,
  fileInputRef,
  onChange,
  onFileChange,
  onNormalize,
}: {
  title: string
  value: string
  fileName: string
  detectedType: DetectedTextType
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onChange: (value: string) => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onNormalize: () => void
}) {
  const { t } = usePreferences()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {fileName || t('comparePasteOrUpload')}
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          {typeLabels[detectedType]}
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('compareTextPlaceholder')}
        className="mt-4 min-h-[280px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:focus:ring-brand-500/30"
        spellCheck={false}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <label className="button-secondary inline-flex cursor-pointer items-center gap-2">
          <UploadIcon className="size-4" />
          {t('compareUploadFile')}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.sql,.json,.md,.markdown,.xml,.html,.htm,.csv,.tsv,.log,.yaml,.yml,.ini,.env,.js,.ts,.tsx,.jsx,.css,.scss,.java,.py,.cs,.go,.rs,.php,text/*,application/json,application/xml"
            onChange={onFileChange}
            className="sr-only"
          />
        </label>
        <button type="button" onClick={onNormalize} className="button-secondary">
          {t('compareNormalize')}
        </button>
      </div>
    </section>
  )
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  )
}

function UnifiedDiff({ lines }: { lines: DiffLine[] }) {
  return (
    <pre className="max-h-[680px] min-h-[360px] overflow-auto bg-slate-950 p-5 text-xs leading-6 text-slate-200 sm:p-6">
      {lines.map((line, index) => (
        <span
          key={`${line.kind}-${index}`}
          className={`block whitespace-pre-wrap ${line.kind === 'added' ? 'bg-emerald-950 text-emerald-200' : line.kind === 'removed' ? 'bg-red-950 text-red-200' : ''}`}
        >
          <span className="mr-3 select-none text-slate-500">
            {line.kind === 'added' ? '+' : line.kind === 'removed' ? '-' : ' '}
          </span>
          {line.value || ' '}
        </span>
      ))}
    </pre>
  )
}

function SideBySideDiff({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="max-h-[680px] min-h-[360px] overflow-auto bg-slate-950">
      <div className="sticky top-0 z-10 grid min-w-[760px] grid-cols-2 bg-slate-900 text-xs font-semibold text-slate-400">
        <p className="border-r border-slate-700 px-5 py-2">Left</p>
        <p className="px-5 py-2">Right</p>
      </div>
      <div className="min-w-[760px]">
        {lines.map((line, index) => (
          <div key={`${line.kind}-${index}`} className="grid grid-cols-2 text-xs leading-6">
            <pre
              className={`min-w-0 whitespace-pre-wrap border-r border-slate-800 px-5 text-slate-200 ${line.kind === 'removed' ? 'bg-red-950 text-red-200' : ''}`}
            >
              <span className="mr-3 select-none text-slate-500">
                {line.leftLineNumber || ''}
              </span>
              {line.kind === 'added' ? '' : line.value || ' '}
            </pre>
            <pre
              className={`min-w-0 whitespace-pre-wrap px-5 text-slate-200 ${line.kind === 'added' ? 'bg-emerald-950 text-emerald-200' : ''}`}
            >
              <span className="mr-3 select-none text-slate-500">
                {line.rightLineNumber || ''}
              </span>
              {line.kind === 'removed' ? '' : line.value || ' '}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

