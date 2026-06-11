import { applyReviewDecision } from './reviewState'
import type { SqlFileResult } from './types'

export type BulkReviewResult = {
  files: SqlFileResult[]
  acceptedCount: number
  skippedCount: number
}

export function acceptAllSafeChanges(files: SqlFileResult[]): BulkReviewResult {
  let acceptedCount = 0
  let skippedCount = 0

  const nextFiles = files.map((file) => {
    if (file.reviewState !== 'needs-review' || !file.proposedFixes.length) {
      return file
    }

    const isSafe = file.proposedFixes.every((fix) => fix.confidence === 'safe')
    if (!isSafe) {
      skippedCount += 1
      return file
    }

    acceptedCount += 1
    return applyReviewDecision(file, 'accepted')
  })

  return {
    files: nextFiles,
    acceptedCount,
    skippedCount,
  }
}
