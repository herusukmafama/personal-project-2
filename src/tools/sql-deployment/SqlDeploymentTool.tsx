import { type ChangeEvent, type DragEvent, useMemo, useRef, useState } from 'react'
import { ShieldIcon, UploadIcon } from '../../components/Icons'
import { usePreferences } from '../../i18n/preferencesContext'
import { generateArtifacts, validateDeployment } from './artifacts'
import { acceptAllSafeChanges } from './bulkReview'
import { sortFilesByDeploymentOrder } from './deploymentOrder'
import { DiffReview } from './DiffReview'
import { downloadDeploymentZip, downloadText } from './downloadArtifacts'
import { processSqlFiles } from './processSqlFiles'
import { applyReviewDecision, updateReviewedOutputName } from './reviewState'
import { buildOutputName } from './sqlAnalyzer'
import type {
  DeploymentMetadata,
  SqlFileResult,
  ValidationFinding,
} from './types'

const initialMetadata: DeploymentMetadata = {
  environment: 'SIT',
  feature: '',
  database: '',
}

export function SqlDeploymentTool() {
  const { t } = usePreferences()
  const inputRef = useRef<HTMLInputElement>(null)
  const [metadata, setMetadata] = useState(initialMetadata)
  const [files, setFiles] = useState<SqlFileResult[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const artifacts = useMemo(() => generateArtifacts(metadata, files), [metadata, files])
  const deploymentFindings = useMemo(() => validateDeployment(metadata, files), [metadata, files])
  const allFindings = [...deploymentFindings, ...files.flatMap((file) => file.findings)]
  const hasErrors = allFindings.some((finding) => finding.severity === 'error')
  const selectedFile = files.find((file) => file.id === selectedId) || files[0]
  const safeReviewCount = files.filter(
    (file) =>
      file.reviewState === 'needs-review'
      && file.proposedFixes.length > 0
      && file.proposedFixes.every((fix) => fix.confidence === 'safe'),
  ).length

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    await processFiles(Array.from(event.target.files || []))
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    await processFiles(Array.from(event.dataTransfer.files || []))
  }

  async function processFiles(uploaded: File[]) {
    const next = await processSqlFiles(uploaded, metadata, {
      onlySqlSupported: t('onlySqlSupported'),
      sqlAnalysisFailed: t('sqlAnalysisFailed'),
    })

    setFiles((current) => sortFilesByDeploymentOrder([...current, ...next]))
    if (!selectedId && next[0]) setSelectedId(next[0].id)
    setMessage(`${next.length} ${t('filesAdded')}`)
  }

  function updateMetadata(field: keyof DeploymentMetadata, value: string) {
    const nextMetadata = { ...metadata, [field]: value } as DeploymentMetadata
    setMetadata(nextMetadata)
    if (field === 'database') {
      setFiles((current) =>
        sortFilesByDeploymentOrder(
          current.map((file) =>
            updateReviewedOutputName(
              file,
              buildOutputName(file.analysis, nextMetadata),
            ),
          ),
        ),
      )
    }
  }

  function updateOutputName(id: string, outputName: string) {
    setFiles((current) =>
      sortFilesByDeploymentOrder(
        current.map((file) =>
          file.id === id ? updateReviewedOutputName(file, outputName) : file,
        ),
      ),
    )
  }

  function decideReview(id: string, decision: 'accepted' | 'rejected' | 'needs-review') {
    setFiles((current) =>
      current.map((file) => {
        if (file.id !== id) return file
        return applyReviewDecision(file, decision)
      }),
    )
  }

  function removeFile(id: string) {
    const next = files.filter((file) => file.id !== id)
    setFiles(next)
    if (selectedId === id) setSelectedId(next[0]?.id || '')
  }

  async function handlePrimaryDownload() {
    if (hasErrors) return
    if (files.length === 1) {
      downloadText(files[0].acceptedSql, files[0].outputName, 'application/sql;charset=utf-8')
      setMessage(`${t('downloaded')} ${files[0].outputName}.`)
      return
    }
    await downloadDeploymentZip(metadata.feature, files, artifacts)
    setMessage(t('deploymentZipDownloaded'))
  }

  async function copyTicketNote() {
    await navigator.clipboard.writeText(artifacts.ticketNote)
    setMessage(t('ticketNoteCopied'))
  }

  function acceptSafeChanges() {
    const result = acceptAllSafeChanges(files)
    setFiles(result.files)
    setMessage(
      `${result.acceptedCount} ${t('safeFilesAccepted')} ${result.skippedCount} ${t('filesNeedManualReview')}`,
    )
  }

  async function copyDeploymentText() {
    await navigator.clipboard.writeText(artifacts.deploymentText)
    setMessage(t('deploymentTextCopied'))
  }

  function reset() {
    setMetadata(initialMetadata)
    setFiles([])
    setSelectedId('')
    setMessage('')
  }

  return (
    <div className="mt-10 space-y-6">
      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5">
          <form
            autoComplete="on"
            onSubmit={(event) => event.preventDefault()}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('deploymentMetadata')}</h2>
            <div className="mt-4 space-y-4">
              <Field label={t('environment')}>
                <select
                  name="deployment_environment"
                  autoComplete="off"
                  value={metadata.environment}
                  onChange={(event) => updateMetadata('environment', event.target.value)}
                  className="input-style"
                >
                  <option value="SIT">SIT</option>
                  <option value="PRODUCTION">PRODUCTION</option>
                </select>
              </Field>
              <Field label={t('feature')}>
                <input
                  name="deployment_feature"
                  autoComplete="on"
                  value={metadata.feature}
                  onChange={(event) => updateMetadata('feature', event.target.value)}
                  placeholder="7438_tasklist_spv_headops"
                  className="input-style"
                />
              </Field>
              <Field label={t('databaseProject')}>
                <input
                  name="deployment_database"
                  autoComplete="on"
                  value={metadata.database}
                  onChange={(event) => updateMetadata('database', event.target.value)}
                  placeholder="idc-collection-v2"
                  className="input-style"
                />
              </Field>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <label
              htmlFor="sql-files"
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(event) => {
                event.preventDefault()
                setIsDragging(false)
              }}
              onDrop={handleDrop}
              className={`block cursor-pointer rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
                isDragging
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-slate-200 bg-slate-50 hover:border-brand-500 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-brand-500 dark:hover:bg-brand-500/10'
              }`}
            >
              <div className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <UploadIcon className="size-6" />
              </div>
              <span className="mt-3 block font-semibold text-slate-900 dark:text-white">
                {isDragging ? t('dropSqlFilesNow') : t('uploadSqlFiles')}
              </span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{t('uploadSqlHint')}</span>
              <span className="mt-2 block text-xs font-medium text-brand-600">{t('multiFileZipHint')}</span>
            </label>
            <input
              ref={inputRef}
              id="sql-files"
              type="file"
              accept=".sql,application/sql,text/plain"
              multiple
              onChange={handleUpload}
              className="sr-only"
            />
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handlePrimaryDownload} disabled={hasErrors} className="button-primary flex-1">
                {files.length > 1 ? t('downloadZip') : t('downloadSql')}
              </button>
              <button type="button" onClick={reset} className="button-secondary">{t('reset')}</button>
            </div>
            {message && <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex gap-3">
              <ShieldIcon className="size-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{t('privateDescription')}</p>
            </div>
          </aside>
        </div>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{t('deploymentOrder')}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('deploymentOrderDescription')}</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={acceptSafeChanges}
                  disabled={!safeReviewCount}
                  className="button-primary"
                >
                  {t('acceptAllSafeChanges')} ({safeReviewCount})
                </button>
                <FindingBadge findings={allFindings} />
              </div>
            </div>
          </div>
          <div className="space-y-3 p-5">
            <FindingList findings={deploymentFindings} />
            {!files.length && <EmptyState text={t('uploadSqlToBegin')} />}
            {files.map((file) => (
              <article
                key={file.id}
                className={`rounded-xl border p-4 ${
                  selectedFile?.id === file.id
                    ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                  <button type="button" onClick={() => setSelectedId(file.id)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-xs text-slate-400">{file.originalName}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {file.analysis.operationCode || t('unresolvedSql')}
                    </p>
                    <p className={`mt-1 text-xs font-medium uppercase tracking-wide ${
                      file.reviewState === 'needs-review'
                        ? 'text-amber-700 dark:text-amber-300'
                        : file.reviewState === 'accepted'
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-400'
                    }`}
                    >
                      {file.reviewState.replace('-', ' ')}
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <SmallButton label={t('removeFile')} onClick={() => removeFile(file.id)}>x</SmallButton>
                  </div>
                </div>
                <input
                  aria-label={`Output filename for ${file.originalName}`}
                  value={file.outputName}
                  onChange={(event) => updateOutputName(file.id, event.target.value)}
                  className="input-style mt-3 font-mono text-xs"
                />
                <FindingList findings={file.findings} />
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Preview
          title={t('acceptedSql')}
          subtitle={selectedFile?.outputName || t('selectSqlFile')}
          content={selectedFile?.acceptedSql || t('sqlPreviewPlaceholder')}
        />
        <div className="space-y-6">
          <Preview
            title="deployment.txt"
            subtitle={t('deploymentTxtSubtitle')}
            content={artifacts.deploymentText}
            action={<button type="button" disabled={hasErrors} onClick={copyDeploymentText} className="button-secondary">{t('copy')}</button>}
          />
          <Preview
            title={t('ticketNote')}
            subtitle={t('ticketNoteSubtitle')}
            content={artifacts.ticketNote}
            action={<button type="button" disabled={hasErrors} onClick={copyTicketNote} className="button-secondary">{t('copy')}</button>}
          />
        </div>
      </section>

      {selectedFile?.proposedFixes.length ? (
        <DiffReview
          original={selectedFile.formattedOriginalSql}
          proposed={selectedFile.proposedSql}
          fixes={selectedFile.proposedFixes}
          reviewState={selectedFile.reviewState}
          onAccept={() => decideReview(selectedFile.id, 'accepted')}
          onReject={() => decideReview(selectedFile.id, 'rejected')}
          onReset={() => decideReview(selectedFile.id, 'needs-review')}
        />
      ) : null}
    </div>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}{children}</label>
}

function FindingBadge({ findings }: { findings: ValidationFinding[] }) {
  const { t } = usePreferences()
  const errors = findings.filter((item) => item.severity === 'error').length
  const warnings = findings.filter((item) => item.severity === 'warning').length
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
      errors
        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200'
        : warnings
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
    }`}
    >
      {errors ? `${errors} ${t('errors')}` : warnings ? `${warnings} ${t('warnings')}` : t('ready')}
    </span>
  )
}

function FindingList({ findings }: { findings: ValidationFinding[] }) {
  const { t } = usePreferences()
  if (!findings.length) return null
  return (
    <ul className="mt-3 space-y-1">
      {findings.map((item) => (
        <li
          key={item.code}
          className={`text-xs ${
            item.severity === 'error'
              ? 'text-red-600 dark:text-red-300'
              : 'text-amber-700 dark:text-amber-300'
          }`}
        >
          {item.severity === 'error' ? t('error') : t('warning')}: {item.message}
        </li>
      ))}
    </ul>
  )
}

function SmallButton({ label, children, onClick, disabled }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">{text}</div>
}

function Preview({ title, subtitle, content, action }: { title: string; subtitle: string; content: string; action?: React.ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {action}
      </div>
      <pre className="max-h-[520px] min-h-48 overflow-auto bg-slate-950 p-5 text-xs leading-6 text-slate-200">
        <code>{content}</code>
      </pre>
    </section>
  )
}
