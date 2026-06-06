import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
} from 'react'
import { FileCodeIcon, ShieldIcon, UploadIcon } from '../../components/Icons'
import {
  formatBytes,
  parseDocxFile,
  validateDocxFile,
} from './docxParser'
import { buildDownloadFileName, downloadJson } from './downloadJson'
import { mapParsedDocumentToJson } from './jsonMapper'
import type { HelpSupportJson } from './types'

type MessageType = 'neutral' | 'error' | 'success'

const initialPreview = '{}'

export function DocxToJsonTool() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [generatedJson, setGeneratedJson] = useState<HelpSupportJson | null>(
    null,
  )
  const [downloadFileName, setDownloadFileName] = useState('converted.json')
  const [status, setStatus] = useState('Waiting for upload')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('neutral')
  const [previewMeta, setPreviewMeta] = useState(
    'Preview will appear after conversion.',
  )
  const [isBusy, setIsBusy] = useState(false)

  const validation = validateDocxFile(selectedFile)
  const jsonPreview = generatedJson
    ? JSON.stringify(generatedJson, null, 2)
    : initialPreview

  function showMessage(value: string, type: MessageType) {
    setMessage(value)
    setMessageType(type)
  }

  function selectFile(file: File | null) {
    setSelectedFile(file)
    setGeneratedJson(null)
    setDownloadFileName(file ? buildDownloadFileName(file.name) : 'converted.json')
    setPreviewMeta('Preview will appear after conversion.')

    if (!file) {
      resetState()
      return
    }

    const nextValidation = validateDocxFile(file)

    if (!nextValidation.valid) {
      setStatus('Validation failed')
      showMessage(nextValidation.errors.join(' '), 'error')
      return
    }

    setStatus('Ready to convert')
    showMessage('File is valid. Click Convert to generate JSON.', 'success')
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] || null)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    selectFile(event.dataTransfer.files?.[0] || null)
  }

  async function handleConvert() {
    if (!selectedFile) {
      showMessage('Please choose a .docx file first.', 'error')
      return
    }

    setIsBusy(true)
    setStatus('Converting')
    showMessage('Reading DOCX and applying mapping rules...', 'neutral')

    try {
      const parsedDocument = await parseDocxFile(selectedFile)
      const mappedJson = mapParsedDocumentToJson(parsedDocument)
      setGeneratedJson(mappedJson)
      setPreviewMeta(
        `${mappedJson.page_title || 'Converted document'} - ${parsedDocument.messages.length} parser message(s)`,
      )
      setStatus('Converted')
      showMessage(
        'JSON generated successfully. You can download the result.',
        'success',
      )
    } catch (error) {
      setGeneratedJson(null)
      setPreviewMeta('Preview will appear after conversion.')
      setStatus('Failed')
      showMessage(
        error instanceof Error ? error.message : 'Conversion failed.',
        'error',
      )
    } finally {
      setIsBusy(false)
    }
  }

  function handleDownload() {
    if (!generatedJson) {
      showMessage('No generated JSON is available to download.', 'error')
      return
    }

    downloadJson(generatedJson, downloadFileName)
    showMessage(`Downloaded ${downloadFileName}.`, 'success')
  }

  function resetState() {
    setSelectedFile(null)
    setGeneratedJson(null)
    setDownloadFileName('converted.json')
    setStatus('Waiting for upload')
    setPreviewMeta('Preview will appear after conversion.')
    showMessage('', 'neutral')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const messageClasses = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }

  return (
    <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">Input document</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {status}
            </span>
          </div>

          <label
            htmlFor="docx-file"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center transition hover:border-brand-500 hover:bg-brand-50/40"
          >
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <UploadIcon className="size-7" />
            </div>
            <span className="mt-4 block font-semibold text-slate-900">
              Choose a Word document
            </span>
            <span className="mt-1 block text-sm text-slate-500">
              Drag and drop or browse, .docx up to 10 MB
            </span>
          </label>
          <input
            ref={fileInputRef}
            id="docx-file"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={isBusy}
            onChange={handleFileSelection}
            className="sr-only"
          />

          <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4 text-sm">
            <div className="grid grid-cols-[70px_1fr] gap-3 py-3">
              <dt className="font-medium text-slate-500">File</dt>
              <dd className="min-w-0 break-words text-slate-800">
                {selectedFile
                  ? `${selectedFile.name} (${formatBytes(selectedFile.size)})`
                  : 'No file selected'}
              </dd>
            </div>
            <div className="grid grid-cols-[70px_1fr] gap-3 py-3">
              <dt className="font-medium text-slate-500">Privacy</dt>
              <dd className="text-slate-800">Processed locally in this browser</dd>
            </div>
          </dl>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isBusy || !selectedFile || !validation.valid}
              onClick={handleConvert}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? 'Converting...' : 'Convert'}
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={resetState}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
          </div>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${messageClasses[messageType]}`}
            >
              {message}
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldIcon className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Private by design</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                No upload, API, database, or file storage is used during
                conversion.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <FileCodeIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900">JSON Preview</h2>
              <p className="truncate text-sm text-slate-500">{previewMeta}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={!generatedJson}
            onClick={handleDownload}
            className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download JSON
          </button>
        </div>
        <pre className="max-h-[720px] min-h-[500px] overflow-auto bg-slate-950 p-5 text-xs leading-6 text-slate-200 sm:p-6">
          <code>{jsonPreview}</code>
        </pre>
      </section>
    </section>
  )
}
