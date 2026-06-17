import { describe, expect, it } from 'vitest'
import { compareText, buildDiffSummaryText } from './compareText'
import { detectTextType } from './detectTextType'
import { normalizeTextForCompare } from './normalizeText'
import type { CompareOptions } from './types'

const defaultOptions: CompareOptions = {
  ignoreWhitespace: false,
  ignoreCase: false,
  trimLineEndings: true,
  showOnlyChanges: false,
}

describe('Compare Text logic', () => {
  it('detects common text types', () => {
    expect(detectTextType('{"name":"OpenTools"}')).toBe('json')
    expect(detectTextType('select * from public.users;')).toBe('sql')
    expect(detectTextType('<root><item /></root>')).toBe('xml')
    expect(detectTextType('<div>Hello</div>')).toBe('html')
    expect(detectTextType('# Title\n- Item')).toBe('markdown')
    expect(detectTextType('a,b\n1,2')).toBe('csv')
    expect(detectTextType('a\tb\n1\t2')).toBe('tsv')
    expect(detectTextType('hello world')).toBe('plain')
  })

  it('normalizes JSON and SQL on demand', () => {
    expect(normalizeTextForCompare('{"a":1}', 'json').value).toBe(
      '{\n  "a": 1\n}\n',
    )
    expect(
      normalizeTextForCompare('select * from users where id=1;', 'sql').value,
    ).toContain('SELECT')
  })

  it('builds line diff summary', () => {
    const result = compareText('one\ntwo\n', 'one\nthree\nfour\n', defaultOptions)

    expect(result.summary.addedLines).toBe(2)
    expect(result.summary.removedLines).toBe(1)
    expect(result.summary.unchangedLines).toBe(1)
    expect(buildDiffSummaryText(result.summary)).toContain('Added lines: 2')
  })

  it('supports ignore whitespace and ignore case options', () => {
    const result = compareText('SELECT  *\n', 'select *\n', {
      ...defaultOptions,
      ignoreWhitespace: true,
      ignoreCase: true,
    })

    expect(result.summary.addedLines).toBe(0)
    expect(result.summary.removedLines).toBe(0)
    expect(result.summary.unchangedLines).toBe(1)
  })

  it('can show only changed lines', () => {
    const result = compareText('same\nold\n', 'same\nnew\n', {
      ...defaultOptions,
      showOnlyChanges: true,
    })

    expect(result.lines.every((line) => line.kind !== 'unchanged')).toBe(true)
  })
})

