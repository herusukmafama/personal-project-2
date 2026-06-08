import type { SqlFileResult } from './types'

function getOutputSequence(outputName: string) {
  const sequence = Number(outputName.match(/^(\d+)_/)?.[1])
  return Number.isFinite(sequence) ? sequence : Number.MAX_SAFE_INTEGER
}

export function sortFilesByDeploymentOrder(files: SqlFileResult[]) {
  return [...files].sort((left, right) => {
    const sequenceDiff = getOutputSequence(left.outputName) - getOutputSequence(right.outputName)
    if (sequenceDiff !== 0) return sequenceDiff
    return left.outputName.localeCompare(right.outputName, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  })
}
