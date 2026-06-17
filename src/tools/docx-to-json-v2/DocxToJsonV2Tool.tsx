import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { FileCodeIcon, ShieldIcon, UploadIcon } from '../../components/Icons'
import { usePreferences } from '../../i18n/preferencesContext'
import { buildDownloadFileName, downloadJson } from '../docx-to-json/downloadJson'
import {
  formatBytes,
  parseTemplateDocxFile,
  validateDocxFile,
} from './docxParser'
import { getTemplateDownloadUrl, TEMPLATE_FILE_NAME } from './downloadTemplate'
import { mapParsedTemplateDocumentToJson } from './jsonMapper'
import type { HelpSupportTemplateJson } from './types'

type MessageType = 'neutral' | 'error' | 'success'

const initialPreview = '{}'

export function DocxToJsonV2Tool() {
  const { t } = usePreferences()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [generatedJson, setGeneratedJson] =
    useState<HelpSupportTemplateJson | null>(null)
  const [downloadFileName, setDownloadFileName] = useState('040002.json')
  const [status, setStatus] = useState(t('waitingForUpload'))
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('neutral')
  const [previewMeta, setPreviewMeta] = useState(t('previewAfterConversion'))
  const [isBusy, setIsBusy] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)

  const jsonPreview = generatedJson
    ? JSON.stringify(generatedJson, null, 2)
    : initialPreview

  useEffect(() => {
    if (!selectedFile && !generatedJson && !message) {
      setStatus(t('waitingForUpload'))
      setPreviewMeta(t('previewAfterConversion'))
    }
  }, [generatedJson, message, selectedFile, t])

  function showMessage(value: string, type: MessageType) {
    setMessage(value)
    setMessageType(type)
  }

  async function selectFile(file: File | null) {
    setSelectedFile(file)
    setGeneratedJson(null)
    setDownloadFileName(file ? buildDownloadFileName(file.name) : '040002.json')
    setPreviewMeta(t('previewAfterConversion'))

    if (!file) {
      resetState()
      return
    }

    const nextValidation = validateDocxFile(file)

    if (!nextValidation.valid) {
      setStatus(t('validationFailed'))
      showMessage(nextValidation.errors.join(' '), 'error')
      return
    }

    await convertFile(file)
  }

  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    await selectFile(event.target.files?.[0] || null)
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragActive(false)
    await selectFile(event.dataTransfer.files?.[0] || null)
  }

  async function convertFile(file: File) {
    setIsBusy(true)
    setStatus(t('converting'))
    showMessage(t('readingDocxV2'), 'neutral')

    try {
      const parsedDocument = await parseTemplateDocxFile(file)
      const mappedJson = mapParsedTemplateDocumentToJson(parsedDocument)
      setGeneratedJson(mappedJson)
      setPreviewMeta(
        `${mappedJson.page_title || t('convertedDocument')} - ${parsedDocument.messages.length} ${t('parserMessages')}`,
      )
      setStatus(t('converted'))
      showMessage(t('jsonGenerated'), 'success')
    } catch (error) {
      setGeneratedJson(null)
      setPreviewMeta(t('previewAfterConversion'))
      setStatus(t('failed'))
      showMessage(
        error instanceof Error ? error.message : t('conversionFailed'),
        'error',
      )
    } finally {
      setIsBusy(false)
    }
  }

  function handleDownload() {
    if (!generatedJson) {
      showMessage(t('noJsonDownload'), 'error')
      return
    }

    downloadJson(generatedJson, downloadFileName)
    showMessage(`${t('downloaded')} ${downloadFileName}.`, 'success')
  }

  function resetState() {
    setSelectedFile(null)
    setGeneratedJson(null)
    setDownloadFileName('040002.json')
    setStatus(t('waitingForUpload'))
    setPreviewMeta(t('previewAfterConversion'))
    setIsDragActive(false)
    showMessage('', 'neutral')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const messageClasses = {
    neutral:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
    error:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
  }

  return (
    <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('templateFirst')}</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              V2
            </span>
          </div>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t('docxV2TemplateDescription')}
          </p>
          <a
            href={getTemplateDownloadUrl()}
            download={TEMPLATE_FILE_NAME}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            {t('downloadWordTemplate')}
          </a>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('inputDocument')}</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {status}
            </span>
          </div>

          <label
            htmlFor="docx-v2-file"
            onDragEnter={() => setIsDragActive(true)}
            onDragLeave={() => setIsDragActive(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={`block cursor-pointer rounded-2xl border-2 border-dashed px-5 py-10 text-center transition ${
              isDragActive
                ? 'border-brand-500 bg-brand-50/70 dark:border-brand-400 dark:bg-brand-500/10'
                : 'border-slate-200 bg-slate-50 hover:border-brand-500 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-brand-500 dark:hover:bg-brand-500/10'
            }`}
          >
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <UploadIcon className="size-7" />
            </div>
            <span className="mt-4 block font-semibold text-slate-900 dark:text-white">
              {t('chooseWordDocument')}
            </span>
            <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
              {t('dragDropDocx')}
            </span>
          </label>
          <input
            ref={fileInputRef}
            id="docx-v2-file"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={isBusy}
            onChange={handleFileSelection}
            className="sr-only"
          />

          <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4 text-sm dark:divide-slate-800 dark:border-slate-800">
            <div className="grid grid-cols-[70px_1fr] gap-3 py-3">
              <dt className="font-medium text-slate-500 dark:text-slate-400">{t('file')}</dt>
              <dd className="min-w-0 break-words text-slate-800 dark:text-slate-200">
                {selectedFile
                  ? `${selectedFile.name} (${formatBytes(selectedFile.size)})`
                  : t('noFileSelected')}
              </dd>
            </div>
            <div className="grid grid-cols-[70px_1fr] gap-3 py-3">
              <dt className="font-medium text-slate-500 dark:text-slate-400">{t('privacy')}</dt>
              <dd className="text-slate-800 dark:text-slate-200">{t('processedLocally')}</dd>
            </div>
          </dl>

          <div className="mt-5">
            <button
              type="button"
              disabled={isBusy}
              onClick={resetState}
              className="button-secondary w-full"
            >
              {t('reset')}
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

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldIcon className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{t('privateByDesign')}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t('localOnlyConversion')}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <FileCodeIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 dark:text-white">{t('jsonPreview')}</h2>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{previewMeta}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={!generatedJson}
            onClick={handleDownload}
            className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('downloadJson')}
          </button>
        </div>
        <pre className="max-h-[720px] min-h-[500px] overflow-auto bg-slate-950 p-5 text-xs leading-6 text-slate-200 sm:p-6">
          <code>{jsonPreview}</code>
        </pre>
      </section>
    </section>
  )
}

