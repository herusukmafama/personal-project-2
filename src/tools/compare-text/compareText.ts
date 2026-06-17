import { diffLines } from 'diff'
import type { CompareOptions, CompareResult, DiffLine, DiffSummary } from './types'

const defaultSummary: DiffSummary = {
  addedLines: 0,
  removedLines: 0,
  unchangedLines: 0,
  changedBlocks: 0,
}

export function compareText(
  left: string,
  right: string,
  options: CompareOptions,
): CompareResult {
  const leftComparable = prepareComparableText(left, options)
  const rightComparable = prepareComparableText(right, options)
  const changes = diffLines(leftComparable, rightComparable)
  const lines: DiffLine[] = []
  const summary = { ...defaultSummary }
  let leftLineNumber = 1
  let rightLineNumber = 1

  changes.forEach((part) => {
    const partLines = splitDiffPart(part.value)
    const kind = part.added ? 'added' : part.removed ? 'removed' : 'unchanged'

    if ((part.added || part.removed) && partLines.length) {
      summary.changedBlocks += 1
    }

    partLines.forEach((line) => {
      if (kind === 'added') {
        summary.addedLines += 1
        lines.push({ kind, value: line, rightLineNumber })
        rightLineNumber += 1
        return
      }

      if (kind === 'removed') {
        summary.removedLines += 1
        lines.push({ kind, value: line, leftLineNumber })
        leftLineNumber += 1
        return
      }

      summary.unchangedLines += 1
      lines.push({ kind, value: line, leftLineNumber, rightLineNumber })
      leftLineNumber += 1
      rightLineNumber += 1
    })
  })

  return {
    lines: options.showOnlyChanges
      ? lines.filter((line) => line.kind !== 'unchanged')
      : lines,
    summary,
  }
}

export function buildDiffSummaryText(summary: DiffSummary) {
  return [
    `Added lines: ${summary.addedLines}`,
    `Removed lines: ${summary.removedLines}`,
    `Changed blocks: ${summary.changedBlocks}`,
    `Unchanged lines: ${summary.unchangedLines}`,
  ].join('\n')
}

function prepareComparableText(value: string, options: CompareOptions) {
  let nextValue = options.trimLineEndings
    ? value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    : value

  if (options.ignoreWhitespace) {
    nextValue = nextValue
      .split(/\n/)
      .map((line) => line.trim().replace(/\s+/g, ' '))
      .join('\n')
  }

  if (options.ignoreCase) {
    nextValue = nextValue.toLowerCase()
  }

  return nextValue
}

function splitDiffPart(value: string) {
  const lines = value.split('\n')

  if (lines.at(-1) === '') {
    lines.pop()
  }

  return lines
}

