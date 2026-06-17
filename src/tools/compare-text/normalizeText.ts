import { format } from 'sql-formatter'
import type { DetectedTextType, NormalizeResult } from './types'

export function normalizeTextForCompare(
  value: string,
  type: DetectedTextType,
): NormalizeResult {
  if (!value.trim()) {
    return { value, changed: false }
  }

  if (type === 'json') {
    const normalized = `${JSON.stringify(JSON.parse(value), null, 2)}\n`
    return {
      value: normalized,
      changed: normalized !== value,
    }
  }

  if (type === 'sql') {
    const normalized =
      format(value, {
        language: 'postgresql',
        keywordCase: 'upper',
        tabWidth: 4,
        linesBetweenQueries: 2,
      }).trim() + '\n'

    return {
      value: normalized,
      changed: normalized !== value,
    }
  }

  const normalized = cleanupWhitespace(value)

  return {
    value: normalized,
    changed: normalized !== value,
  }
}

export function cleanupWhitespace(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
}

