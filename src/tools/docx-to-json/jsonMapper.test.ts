// @vitest-environment jsdom

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import mammoth from 'mammoth'
import { beforeAll, describe, expect, it } from 'vitest'
import { formatBytes, validateDocxFile } from './docxParser'
import { mapParsedDocumentToJson } from './jsonMapper'
import type { HelpSupportJson, ParsedDocument } from './types'

type LegacyWindow = Window & {
  JsonMapper: {
    mapParsedDocumentToJson: (document: ParsedDocument) => HelpSupportJson
  }
}

let legacyMapper: LegacyWindow['JsonMapper']

beforeAll(async () => {
  const legacyMapperSource = await readFile(
    resolve('legacy/assets/js/json-mapper.js'),
    'utf8',
  )
  const loadLegacyMapper = new Function('window', legacyMapperSource)
  loadLegacyMapper(window)
  legacyMapper = (window as unknown as LegacyWindow).JsonMapper
})

describe('DOCX to JSON migration parity', () => {
  it.each([
    'sample_01.docx',
    '030175-DF Bulk Decisioning BC Score.docx',
  ])(
    'matches the legacy mapper for %s',
    async (fileName) => {
      const bytes = await readFile(resolve('legacy/samples/word', fileName))
      const result = await mammoth.convertToHtml(
        { buffer: bytes },
        {
          includeDefaultStyleMap: true,
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
          ],
        },
      )
      const htmlDocument = new DOMParser().parseFromString(
        result.value,
        'text/html',
      )
      const parsedDocument: ParsedDocument = {
        fileName,
        fileSize: bytes.byteLength,
        html: result.value,
        text: normalizeSpaces(htmlDocument.body.textContent),
        metadata: extractMetadataTable(htmlDocument),
        messages: result.messages.map((message) => ({
          type: message.type,
          message: message.message,
        })),
      }

      expect(mapParsedDocumentToJson(parsedDocument)).toEqual(
        legacyMapper.mapParsedDocumentToJson(parsedDocument),
      )
    },
    20_000,
  )

  it('preserves file validation and formatting behavior', () => {
    expect(validateDocxFile(null)).toEqual({
      valid: false,
      errors: ['Please choose a .docx file.'],
    })
    expect(formatBytes(10 * 1024 * 1024)).toBe('10.0 MB')
  })
})

function extractMetadataTable(htmlDocument: Document) {
  const metadata: Record<string, string> = {}
  const firstTable = htmlDocument.querySelector('table')

  firstTable?.querySelectorAll('tr').forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td, th'))

    if (cells.length < 2) {
      return
    }

    const key = normalizeSpaces(cells[0].textContent)
      .toLowerCase()
      .replace(/[^a-z0-9]+(.)/g, (_, character: string) =>
        character.toUpperCase(),
      )
    const value = normalizeSpaces(cells[1].textContent)

    if (key && value) {
      metadata[key] = value
    }
  })

  return metadata
}

function normalizeSpaces(value: unknown) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
