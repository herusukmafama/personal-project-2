import mammoth from 'mammoth'
import type { ParsedDocument, ValidationResult } from './types'

export const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

const DOCX_EXTENSION = '.docx'
const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export class FileValidationError extends Error {
  messages: string[]

  constructor(messages: string[]) {
    super(messages.join(' '))
    this.name = 'FileValidationError'
    this.messages = messages
  }
}

export function validateDocxFile(
  file: File | null,
  options: { maxFileSizeBytes?: number } = {},
): ValidationResult {
  const maxFileSizeBytes =
    options.maxFileSizeBytes || DEFAULT_MAX_FILE_SIZE_BYTES
  const errors: string[] = []

  if (!file) {
    errors.push('Please choose a .docx file.')
    return { valid: false, errors }
  }

  const fileName = file.name || ''
  const hasDocxExtension = fileName.toLowerCase().endsWith(DOCX_EXTENSION)
  const hasSupportedMimeType = !file.type || file.type === DOCX_MIME_TYPE

  if (!hasDocxExtension || !hasSupportedMimeType) {
    errors.push('Only Microsoft Word .docx files are supported.')
  }

  if (file.size === 0) {
    errors.push('The selected file is empty.')
  }

  if (file.size > maxFileSizeBytes) {
    errors.push(
      `The selected file is larger than ${formatBytes(maxFileSizeBytes)}.`,
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export async function parseDocxFile(
  file: File,
  options: { maxFileSizeBytes?: number } = {},
): Promise<ParsedDocument> {
  const validation = validateDocxFile(file, options)

  if (!validation.valid) {
    throw new FileValidationError(validation.errors)
  }

  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      includeDefaultStyleMap: true,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ],
    },
  )

  const htmlDocument = new DOMParser().parseFromString(result.value, 'text/html')

  return {
    fileName: file.name,
    fileSize: file.size,
    html: result.value,
    text: normalizeSpaces(htmlDocument.body.textContent || ''),
    metadata: extractMetadataTable(htmlDocument),
    messages: (result.messages || []).map((message) => ({
      type: message.type || 'info',
      message: message.message || String(message),
    })),
  }
}

function extractMetadataTable(htmlDocument: Document) {
  const metadata: Record<string, string> = {}
  const firstTable = htmlDocument.querySelector('table')

  if (!firstTable) {
    return metadata
  }

  firstTable.querySelectorAll('tr').forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td, th'))

    if (cells.length < 2) {
      return
    }

    const key = normalizeKey(cells[0].textContent)
    const value = normalizeSpaces(cells[1].textContent)

    if (key && value) {
      metadata[key] = value
    }
  })

  return metadata
}

function normalizeKey(value: string | null) {
  return normalizeSpaces(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, character: string) =>
      character.toUpperCase(),
    )
}

function normalizeSpaces(value: unknown) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
