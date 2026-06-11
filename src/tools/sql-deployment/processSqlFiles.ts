import { proposeGuidelineFixes } from './guidelineTransformer'
import { analyzeSql, buildOutputName, validateSql } from './sqlAnalyzer'
import { formatPostgresqlSql } from './sqlFormatter'
import type { DeploymentMetadata, SqlFileResult } from './types'

export async function processSqlFiles(
  uploaded: File[],
  metadata: DeploymentMetadata,
  messages: {
    onlySqlSupported: string
    sqlAnalysisFailed: string
  },
): Promise<SqlFileResult[]> {
  const results: SqlFileResult[] = []

  for (const file of uploaded) {
    if (!file.name.toLowerCase().endsWith('.sql')) {
      results.push(invalidFile(file, messages.onlySqlSupported))
      continue
    }

    const originalSql = await file.text()
    try {
      const analysis = analyzeSql(originalSql)
      const formattedOriginalSql = formatPostgresqlSql(originalSql)
      const proposal = proposeGuidelineFixes(formattedOriginalSql)
      const outputName = buildOutputName(analysis, metadata)
      results.push({
        id: crypto.randomUUID(),
        originalName: file.name,
        outputName,
        originalSql,
        formattedOriginalSql,
        proposedSql: proposal.proposedSql,
        acceptedSql: formattedOriginalSql,
        proposedFixes: proposal.fixes,
        reviewState: proposal.fixes.length ? 'needs-review' : 'no-changes',
        analysis,
        findings: validateSql(originalSql, outputName, analysis),
      })
    } catch (error) {
      results.push(
        invalidFile(
          file,
          error instanceof Error ? error.message : messages.sqlAnalysisFailed,
        ),
      )
    }
  }

  return results
}

function invalidFile(file: File, message: string): SqlFileResult {
  return {
    id: crypto.randomUUID(),
    originalName: file.name,
    outputName: file.name,
    originalSql: '',
    formattedOriginalSql: '',
    proposedSql: '',
    acceptedSql: '',
    proposedFixes: [],
    reviewState: 'no-changes',
    analysis: { sequence: '', schema: '', objectName: '', operationCode: '', statementCount: 0 },
    findings: [{ code: 'processing-failed', severity: 'error', message }],
  }
}
