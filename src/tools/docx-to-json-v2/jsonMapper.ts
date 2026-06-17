import templateJson from './040002Template.json'
import type { HelpSupportTemplateJson, ParsedTemplateDocument } from './types'

export const TEMPLATE_MARKER = 'DOCX_TO_JSON_V2_040002'

const JSON_PATH_HEADER = 'jsonPath'
const VALUE_HEADER = 'value'
const OMIT = Symbol('omit')
const STRUCTURAL_KEYS = new Set(['type', 'order'])

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }
type TemplateUpdate = { path: string; value: string }

export class TemplateStructureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TemplateStructureError'
  }
}

export function getBaseTemplateJson(): HelpSupportTemplateJson {
  return cloneJson(templateJson as HelpSupportTemplateJson)
}

export function mapParsedTemplateDocumentToJson(
  parsedDocument: ParsedTemplateDocument,
): HelpSupportTemplateJson {
  const htmlDocument = new DOMParser().parseFromString(
    parsedDocument.html,
    'text/html',
  )

  if (!isSupportedTemplate(parsedDocument)) {
    throw new TemplateStructureError(
      'This Word file does not look like the DOCX to JSON V2 040002 template. Please download the template and fill the Value column.',
    )
  }

  const updates = collectTemplateUpdates(htmlDocument)

  if (!updates.length) {
    throw new TemplateStructureError(
      'No editable template values were found. Please fill the Value column in the DOCX to JSON V2 template.',
    )
  }

  return buildPartialTemplateJson(getBaseTemplateJson(), updates)
}

export function collectStringTemplateFields(value: JsonValue, basePath = '') {
  const fields: Array<{ path: string; value: string; label: string }> = []

  if (typeof value === 'string') {
    fields.push({
      path: basePath || '/',
      value,
      label: buildFieldLabel(basePath || '/'),
    })
    return fields
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      fields.push(
        ...collectStringTemplateFields(item, `${basePath}/${index}`),
      )
    })
    return fields
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => {
      fields.push(
        ...collectStringTemplateFields(
          child,
          `${basePath}/${escapeJsonPointerToken(key)}`,
        ),
      )
    })
  }

  return fields
}

export function buildPartialTemplateJson(
  baseTemplate: HelpSupportTemplateJson,
  updates: TemplateUpdate[],
): HelpSupportTemplateJson {
  const updateValues = new Map(updates.map((update) => [update.path, update.value]))
  const selectedPaths = new Set(updateValues.keys())
  const prunedValue = pruneJsonValue(
    baseTemplate as unknown as JsonValue,
    '',
    selectedPaths,
    updateValues,
  )

  return prunedValue as HelpSupportTemplateJson
}

function collectTemplateUpdates(htmlDocument: Document) {
  const updates: TemplateUpdate[] = []

  htmlDocument.querySelectorAll('table').forEach((table) => {
    const rows = Array.from(table.querySelectorAll('tr'))
    const headerCells = Array.from(rows[0]?.querySelectorAll('td, th') || [])
    const headers = headerCells.map((cell) => normalizeHeader(cell.textContent))
    const jsonPathIndex = headers.indexOf(JSON_PATH_HEADER)
    const valueIndex = headers.indexOf(VALUE_HEADER)

    if (jsonPathIndex < 0 || valueIndex < 0) {
      return
    }

    rows.slice(1).forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td, th'))
      const path = normalizeText(cells[jsonPathIndex]?.textContent)

      if (!path.startsWith('/')) {
        return
      }

      const valueCell = cells[valueIndex]
      const value = readValueCell(valueCell, path)

      updates.push({ path, value })
    })
  })

  return updates
}

function isSupportedTemplate(parsedDocument: ParsedTemplateDocument) {
  return (
    parsedDocument.text.includes(TEMPLATE_MARKER) ||
    Object.values(parsedDocument.metadata).some((value) =>
      value.includes(TEMPLATE_MARKER),
    )
  )
}

function readValueCell(cell: Element | undefined, path: string) {
  if (!cell) {
    return ''
  }

  const fieldName = getLastPathToken(path)

  if (fieldName === 'description') {
    return normalizeHtml(cell.innerHTML)
  }

  return normalizeText(cell.textContent)
}

function pruneJsonValue(
  value: JsonValue,
  path: string,
  selectedPaths: Set<string>,
  updateValues: Map<string, string>,
): JsonValue | typeof OMIT {
  if (typeof value === 'string') {
    return selectedPaths.has(path) ? updateValues.get(path) || '' : OMIT
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item, index) =>
        pruneJsonValue(item, `${path}/${index}`, selectedPaths, updateValues),
      )
      .filter((item) => item !== OMIT)

    return items.length ? (items as JsonValue[]) : OMIT
  }

  if (value && typeof value === 'object') {
    const nextObject: Record<string, JsonValue> = {}
    let hasSelectedContent = false

    Object.entries(value).forEach(([key, child]) => {
      const childPath = `${path}/${escapeJsonPointerToken(key)}`
      const isStructural = STRUCTURAL_KEYS.has(key)
      const prunedChild = pruneJsonValue(
        child,
        childPath,
        selectedPaths,
        updateValues,
      )

      if (prunedChild !== OMIT) {
        nextObject[key] = prunedChild
        hasSelectedContent = hasSelectedContent || !isStructural
      }
    })

    if (!hasSelectedContent && !isRootPath(path)) {
      return OMIT
    }

    Object.entries(value).forEach(([key, child]) => {
      if (key in nextObject) {
        return
      }

      if (STRUCTURAL_KEYS.has(key) && isPrimitiveStructuralValue(child)) {
        nextObject[key] = cloneJson(child)
      }

      if (Array.isArray(child) && child.length === 0) {
        nextObject[key] = []
      }
    })

    return nextObject
  }

  return OMIT
}

function buildFieldLabel(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map(unescapeJsonPointerToken)
    .map((part) => (Number.isNaN(Number(part)) ? part : `item ${Number(part) + 1}`))
    .join(' > ')
}

function getLastPathToken(path: string) {
  const token = path.split('/').filter(Boolean).at(-1) || ''
  return unescapeJsonPointerToken(token)
}

function normalizeHeader(value: unknown) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, character: string) =>
      character.toUpperCase(),
    )
}

function normalizeText(value: unknown) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeHtml(value: unknown) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/>\s+</g, '> <')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function escapeJsonPointerToken(value: string) {
  return value.replace(/~/g, '~0').replace(/\//g, '~1')
}

function unescapeJsonPointerToken(value: string) {
  return value.replace(/~1/g, '/').replace(/~0/g, '~')
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isRootPath(path: string) {
  return path === ''
}

function isPrimitiveStructuralValue(value: JsonValue) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  )
}
