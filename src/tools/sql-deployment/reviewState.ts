import { analyzeSql, validateSql } from './sqlAnalyzer'
import type { ReviewState, SqlFileResult } from './types'

export function applyReviewDecision(
  file: SqlFileResult,
  reviewState: Exclude<ReviewState, 'no-changes'>,
): SqlFileResult {
  const acceptedSql =
    reviewState === 'accepted' ? file.proposedSql : file.formattedOriginalSql
  const analysis = analyzeSql(acceptedSql)
  return {
    ...file,
    acceptedSql,
    analysis,
    reviewState,
    findings: validateSql(acceptedSql, file.outputName, analysis),
  }
}

export function updateReviewedOutputName(
  file: SqlFileResult,
  outputName: string,
): SqlFileResult {
  return {
    ...file,
    outputName,
    findings: validateSql(file.acceptedSql, outputName, file.analysis),
  }
}
