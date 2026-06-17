export type DetectedTextType =
  | 'sql'
  | 'json'
  | 'xml'
  | 'html'
  | 'markdown'
  | 'csv'
  | 'tsv'
  | 'plain'

export type CompareOptions = {
  ignoreWhitespace: boolean
  ignoreCase: boolean
  trimLineEndings: boolean
  showOnlyChanges: boolean
}

export type DiffLineKind = 'added' | 'removed' | 'unchanged'

export type DiffLine = {
  kind: DiffLineKind
  value: string
  leftLineNumber?: number
  rightLineNumber?: number
}

export type DiffSummary = {
  addedLines: number
  removedLines: number
  unchangedLines: number
  changedBlocks: number
}

export type CompareResult = {
  lines: DiffLine[]
  summary: DiffSummary
}

export type NormalizeResult = {
  value: string
  changed: boolean
}

