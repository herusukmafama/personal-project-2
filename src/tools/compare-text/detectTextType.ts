import type { DetectedTextType } from './types'

const SQL_PATTERN =
  /\b(select|insert|update|delete|create|alter|drop|with|from|where|join|function|procedure|table|view)\b/i
const MARKDOWN_PATTERN = /(^|\n)\s{0,3}(#{1,6}\s|\* |- |\d+\. |> |\|.+\|)/m
const XML_PATTERN = /^\s*<\?xml[\s\S]*\?>|^\s*<[a-zA-Z][\w:.-]*(\s|>|\/>)/m
const HTML_PATTERN =
  /<\/?(html|head|body|div|span|p|a|table|tr|td|th|ul|ol|li|section|article|main|header|footer)\b/i

export function detectTextType(value: string): DetectedTextType {
  const text = value.trim()

  if (!text) {
    return 'plain'
  }

  if (isJson(text)) {
    return 'json'
  }

  if (HTML_PATTERN.test(text)) {
    return 'html'
  }

  if (XML_PATTERN.test(text)) {
    return 'xml'
  }

  if (SQL_PATTERN.test(text) && /[;()]|\bfrom\b|\btable\b/i.test(text)) {
    return 'sql'
  }

  if (looksLikeDelimited(text, '\t')) {
    return 'tsv'
  }

  if (looksLikeDelimited(text, ',')) {
    return 'csv'
  }

  if (MARKDOWN_PATTERN.test(text)) {
    return 'markdown'
  }

  return 'plain'
}

function isJson(text: string) {
  if (!text.startsWith('{') && !text.startsWith('[')) {
    return false
  }

  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

function looksLikeDelimited(text: string, delimiter: string) {
  const rows = text
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)

  if (rows.length < 2 || !rows.every((row) => row.includes(delimiter))) {
    return false
  }

  const columnCounts = rows.slice(0, 5).map((row) => row.split(delimiter).length)
  const firstCount = columnCounts[0]

  return firstCount > 1 && columnCounts.every((count) => count === firstCount)
}

