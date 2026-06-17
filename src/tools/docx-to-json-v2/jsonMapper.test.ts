// @vitest-environment jsdom

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import mammoth from 'mammoth'
import { describe, expect, it } from 'vitest'
import { validateDocxFile } from './docxParser'
import {
  getBaseTemplateJson,
  mapParsedTemplateDocumentToJson,
  TemplateStructureError,
} from './jsonMapper'
import type { ParsedTemplateDocument } from './types'

describe('DOCX to JSON V2 template mapper', () => {
  it('builds a partial JSON result from the Word template rows that are kept', () => {
    const mappedJson = mapParsedTemplateDocumentToJson(
      parsedDocumentFromHtml(`
        <p>DOCX_TO_JSON_V2_040002</p>
        <table>
          <tr><th>JSON Path</th><th>Field</th><th>Default Value</th><th>Value</th></tr>
          <tr><td>/page_title</td><td>Page Title</td><td></td><td>New Help Page</td></tr>
          <tr><td>/breadcrumb/2/label</td><td>Breadcrumb</td><td></td><td>New Breadcrumb</td></tr>
          <tr><td>/page_content/section/0/title</td><td>Section Title</td><td></td><td>New Section</td></tr>
          <tr><td>/page_content/section/0/description</td><td>Description</td><td></td><td><p>New <strong>rich</strong> description</p></td></tr>
        </table>
      `),
    )

    expect(mappedJson.page_title).toBe('New Help Page')
    expect(mappedJson.breadcrumb).toEqual([{ label: 'New Breadcrumb' }])
    expect(mappedJson.page_content.navigations).toBeUndefined()
    expect((mappedJson.page_content.section[0] as { title: string }).title).toBe(
      'New Section',
    )
    expect(
      (mappedJson.page_content.section[0] as { description: string })
        .description,
    ).toBe('<p>New <strong>rich</strong> description</p>')
  })

  it('outputs blank text when a kept row has an empty Value cell', () => {
    const mappedJson = mapParsedTemplateDocumentToJson(
      parsedDocumentFromHtml(`
        <p>DOCX_TO_JSON_V2_040002</p>
        <table>
          <tr><th>JSON Path</th><th>Field</th><th>Default Value</th><th>Value</th></tr>
          <tr><td>/page_title</td><td>Page Title</td><td></td><td></td></tr>
        </table>
      `),
    )

    expect(mappedJson.page_title).toBe('')
    expect(mappedJson.breadcrumb).toBeUndefined()
  })

  it('omits deleted sections and keeps only the selected section branch', () => {
    const mappedJson = mapParsedTemplateDocumentToJson(
      parsedDocumentFromHtml(`
        <p>DOCX_TO_JSON_V2_040002</p>
        <table>
          <tr><th>JSON Path</th><th>Field</th><th>Default Value</th><th>Value</th></tr>
          <tr><td>/page_content/section/1/title</td><td>Section Title</td><td></td><td>Implementation Only</td></tr>
          <tr><td>/page_content/section/1/data/0/title</td><td>Child Title</td><td></td><td>Folder Setup</td></tr>
        </table>
      `),
    )

    expect(mappedJson.page_content.section).toEqual([
      {
        title: 'Implementation Only',
        data: [{ title: 'Folder Setup' }],
      },
    ])
  })

  it('keeps required type and order fields for retained content objects', () => {
    const mappedJson = mapParsedTemplateDocumentToJson(
      parsedDocumentFromHtml(`
        <p>DOCX_TO_JSON_V2_040002</p>
        <table>
          <tr><th>JSON Path</th><th>Field</th><th>Default Value</th><th>Value</th></tr>
          <tr><td>/page_content/section/0/data/1/data/0/image/0/url</td><td>Image URL</td><td></td><td>main/custom.png</td></tr>
        </table>
      `),
    )
    const imageItem = (
      (mappedJson.page_content.section[0] as { data: Array<{ data: unknown[] }> })
        .data[0].data[0] as { image: Array<{ url: string }>; order: number; type: string }
    )

    expect(imageItem).toEqual({
      order: 1,
      image: [{ url: 'main/custom.png' }],
      type: 'image',
    })
  })

  it('rejects DOCX files that do not contain the V2 template marker', () => {
    expect(() =>
      mapParsedTemplateDocumentToJson(
        parsedDocumentFromHtml(`
          <table>
            <tr><th>JSON Path</th><th>Field</th><th>Default Value</th><th>Value</th></tr>
            <tr><td>/page_title</td><td>Page Title</td><td></td><td>Ignored</td></tr>
          </table>
        `),
      ),
    ).toThrow(TemplateStructureError)
  })

  it('validates unsupported files with the existing DOCX rules', () => {
    expect(
      validateDocxFile(new File(['not word'], 'example.txt', { type: 'text/plain' })),
    ).toEqual({
      valid: false,
      errors: ['Only Microsoft Word .docx files are supported.'],
    })
  })

  it('parses the downloadable Word template and produces the full 040002 shape', async () => {
    const baseJson = getBaseTemplateJson()
    const bytes = await readFile(
      resolve('public/templates/help-support-040002-template.docx'),
    )
    const result = await mammoth.convertToHtml({
      buffer: bytes,
    })
    const htmlDocument = new DOMParser().parseFromString(
      result.value,
      'text/html',
    )
    const mappedJson = mapParsedTemplateDocumentToJson({
      fileName: 'help-support-040002-template.docx',
      fileSize: bytes.byteLength,
      html: result.value,
      text: htmlDocument.body.textContent || '',
      metadata: {},
      messages: result.messages.map((message) => ({
        type: message.type || 'info',
        message: message.message || String(message),
      })),
    })

    expect(mappedJson.page_title).toBe('')
    expect(mappedJson.breadcrumb).toHaveLength(baseJson.breadcrumb.length)
    expect(mappedJson.page_content.section).toHaveLength(
      baseJson.page_content.section.length,
    )
    expect(mappedJson.page_content.type).toBe('')
  }, 20_000)
})

function parsedDocumentFromHtml(html: string): ParsedTemplateDocument {
  const document = new DOMParser().parseFromString(html, 'text/html')

  return {
    fileName: 'template.docx',
    fileSize: 1,
    html,
    text: document.body.textContent || '',
    metadata: {},
    messages: [],
  }
}
