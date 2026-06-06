import { type ChangeEvent, useMemo, useRef, useState } from 'react'
import { ShieldIcon, UploadIcon } from '../../components/Icons'
import { generateArtifacts, validateDeployment } from './artifacts'
import { downloadDeploymentZip, downloadText } from './downloadArtifacts'
import { analyzeSql, buildOutputName, validateSql } from './sqlAnalyzer'
import { formatPostgresqlSql } from './sqlFormatter'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [metadata, setMetadata] = useState(initialMetadata)
  const [files, setFiles] = useState<SqlFileResult[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')

  const artifacts = useMemo(() => generateArtifacts(metadata, files), [metadata, files])
  const deploymentFindings = useMemo(() => validateDeployment(metadata, files), [metadata, files])
  const allFindings = [...deploymentFindings, ...files.flatMap((file) => file.findings)]
  const hasErrors = allFindings.some((finding) => finding.severity === 'error')
  const selectedFile = files.find((file) => file.id === selectedId) || files[0]

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const uploaded = Array.from(event.target.files || [])
    const next: SqlFileResult[] = []

    for (const file of uploaded) {
      if (!file.name.toLowerCase().endsWith('.sql')) {
        next.push(invalidFile(file, 'Only .sql files are supported.'))
        continue
      }
      const originalSql = await file.text()
      try {
        const analysis = analyzeSql(originalSql)
        next.push({
          id: crypto.randomUUID(),
          originalName: file.name,
          outputName: buildOutputName(analysis, metadata),
          originalSql,
          formattedSql: formatPostgresqlSql(originalSql),
          analysis,
          findings: validateSql(originalSql, file.name, analysis),
        })
      } catch (error) {
        next.push(invalidFile(file, error instanceof Error ? error.message : 'SQL analysis failed.'))
      }
    }

    setFiles((current) => [...current, ...next])
    if (!selectedId && next[0]) setSelectedId(next[0].id)
    setMessage(`${next.length} file(s) added.`)
    if (inputRef.current) inputRef.current.value = ''
  }

  function updateMetadata(field: keyof DeploymentMetadata, value: string) {
    const nextMetadata = { ...metadata, [field]: value } as DeploymentMetadata
    setMetadata(nextMetadata)
    if (field === 'database') {
      setFiles((current) =>
        current.map((file) => ({
          ...file,
          outputName: buildOutputName(file.analysis, nextMetadata),
        })),
      )
    }
  }

  function updateOutputName(id: string, outputName: string) {
    setFiles((current) =>
      current.map((file) => (file.id === id ? { ...file, outputName } : file)),
    )
  }

  function moveFile(index: number, offset: number) {
    const target = index + offset
    if (target < 0 || target >= files.length) return
    const next = [...files]
    ;[next[index], next[target]] = [next[target], next[index]]
    setFiles(next)
  }

  function removeFile(id: string) {
    const next = files.filter((file) => file.id !== id)
    setFiles(next)
    if (selectedId === id) setSelectedId(next[0]?.id || '')
  }

  async function handlePrimaryDownload() {
    if (hasErrors) return
    if (files.length === 1) {
      downloadText(files[0].formattedSql, files[0].outputName, 'application/sql;charset=utf-8')
      setMessage(`Downloaded ${files[0].outputName}.`)
      return
    }
    await downloadDeploymentZip(metadata.feature, files, artifacts)
    setMessage('Deployment ZIP downloaded.')
  }

  async function copyTicketNote() {
    await navigator.clipboard.writeText(artifacts.ticketNote)
    setMessage('Ticket note copied.')
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
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Deployment metadata</h2>
            <div className="mt-4 space-y-4">
              <Field label="Environment">
                <select
                  value={metadata.environment}
                  onChange={(event) => updateMetadata('environment', event.target.value)}
                  className="input-style"
                >
                  <option value="SIT">SIT</option>
                  <option value="PRODUCTION">PRODUCTION</option>
                </select>
              </Field>
              <Field label="Feature">
                <input
                  value={metadata.feature}
                  onChange={(event) => updateMetadata('feature', event.target.value)}
                  placeholder="7438_tasklist_spv_headops"
                  className="input-style"
                />
              </Field>
              <Field label="Database / project">
                <input
                  value={metadata.database}
                  onChange={(event) => updateMetadata('database', event.target.value)}
                  placeholder="idc-collection-v2"
                  className="input-style"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="sql-files"
              className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-brand-500 hover:bg-brand-50/40"
            >
              <div className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <UploadIcon className="size-6" />
              </div>
              <span className="mt-3 block font-semibold text-slate-900">Upload SQL files</span>
              <span className="mt-1 block text-xs text-slate-500">Select one or multiple .sql files</span>
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
                {files.length > 1 ? 'Download ZIP' : 'Download SQL'}
              </button>
              <button type="button" onClick={reset} className="button-secondary">Reset</button>
            </div>
            {message && <p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex gap-3">
              <ShieldIcon className="size-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-500">SQL files stay in your browser and are never uploaded.</p>
            </div>
          </aside>
        </div>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Deployment order</h2>
                <p className="mt-1 text-sm text-slate-500">Review filenames and arrange execution order.</p>
              </div>
              <FindingBadge findings={allFindings} />
            </div>
          </div>
          <div className="space-y-3 p-5">
            <FindingList findings={deploymentFindings} />
            {!files.length && <EmptyState text="Upload SQL files to begin." />}
            {files.map((file, index) => (
              <article
                key={file.id}
                className={`rounded-xl border p-4 ${selectedFile?.id === file.id ? 'border-brand-500 bg-brand-50/30' : 'border-slate-200'}`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                  <button type="button" onClick={() => setSelectedId(file.id)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-xs text-slate-400">{file.originalName}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{file.analysis.operationCode || 'Unresolved SQL'}</p>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <SmallButton label="Move up" onClick={() => moveFile(index, -1)} disabled={index === 0}>↑</SmallButton>
                    <SmallButton label="Move down" onClick={() => moveFile(index, 1)} disabled={index === files.length - 1}>↓</SmallButton>
                    <SmallButton label="Remove file" onClick={() => removeFile(file.id)}>×</SmallButton>
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
        <Preview title="Formatted SQL" subtitle={selectedFile?.outputName || 'Select a SQL file'} content={selectedFile?.formattedSql || '-- SQL preview will appear here'} />
        <div className="space-y-6">
          <Preview
            title="deployment.txt"
            subtitle="Generated from the ordered SQL list"
            content={artifacts.deploymentText}
            action={<button type="button" disabled={hasErrors} onClick={() => downloadText(artifacts.deploymentText, 'deployment.txt')} className="button-secondary">Download</button>}
          />
          <Preview
            title="Ticket note"
            subtitle="Copy this English note into the deployment ticket"
            content={artifacts.ticketNote}
            action={<button type="button" disabled={hasErrors} onClick={copyTicketNote} className="button-secondary">Copy</button>}
          />
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}</label>
}

function FindingBadge({ findings }: { findings: ValidationFinding[] }) {
  const errors = findings.filter((item) => item.severity === 'error').length
  const warnings = findings.filter((item) => item.severity === 'warning').length
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${errors ? 'bg-red-50 text-red-700' : warnings ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{errors ? `${errors} error(s)` : warnings ? `${warnings} warning(s)` : 'Ready'}</span>
}

function FindingList({ findings }: { findings: ValidationFinding[] }) {
  if (!findings.length) return null
  return <ul className="mt-3 space-y-1">{findings.map((item) => <li key={item.code} className={`text-xs ${item.severity === 'error' ? 'text-red-600' : 'text-amber-700'}`}>{item.severity === 'error' ? 'Error' : 'Warning'}: {item.message}</li>)}</ul>
}

function SmallButton({ label, children, onClick, disabled }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30">{children}</button>
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center text-sm text-slate-400">{text}</div>
}

function Preview({ title, subtitle, content, action }: { title: string; subtitle: string; content: string; action?: React.ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5"><div className="min-w-0"><h2 className="font-semibold text-slate-900">{title}</h2><p className="truncate text-xs text-slate-500">{subtitle}</p></div>{action}</div><pre className="max-h-[520px] min-h-48 overflow-auto bg-slate-950 p-5 text-xs leading-6 text-slate-200"><code>{content}</code></pre></section>
}

function invalidFile(file: File, message: string): SqlFileResult {
  return {
    id: crypto.randomUUID(),
    originalName: file.name,
    outputName: file.name,
    originalSql: '',
    formattedSql: '',
    analysis: { sequence: '', schema: '', objectName: '', operationCode: '', statementCount: 0 },
    findings: [{ code: 'processing-failed', severity: 'error', message }],
  }
}
