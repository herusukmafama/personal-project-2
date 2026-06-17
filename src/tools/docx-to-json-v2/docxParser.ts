import mammoth from 'mammoth'
import {
  FileValidationError,
  formatBytes,
  validateDocxFile,
} from '../docx-to-json/docxParser'
import type { ParsedTemplateDocument } from './types'

export { FileValidationError, formatBytes, validateDocxFile }

export async function parseTemplateDocxFile(
  file: File,
): Promise<ParsedTemplateDocument> {
  const validation = validateDocxFile(file)

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

  firstTable?.querySelectorAll('tr').forEach((row) => {
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

