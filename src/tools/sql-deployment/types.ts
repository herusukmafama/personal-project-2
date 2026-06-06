export type DeploymentEnvironment = 'SIT' | 'PRODUCTION'

export type DeploymentMetadata = {
  environment: DeploymentEnvironment
  feature: string
  database: string
}

export type FindingSeverity = 'error' | 'warning'

export type ValidationFinding = {
  code: string
  severity: FindingSeverity
  message: string
}

export type SqlAnalysis = {
  sequence: string
  schema: string
  objectName: string
  operationCode: string
  parameterCount?: number
  statementCount: number
}

export type ReviewState = 'no-changes' | 'needs-review' | 'accepted' | 'rejected'
export type FixConfidence = 'safe' | 'confirmation-required'

export type ProposedFix = {
  code: string
  title: string
  description: string
  confidence: FixConfidence
}

export type SqlFileResult = {
  id: string
  originalName: string
  outputName: string
  originalSql: string
  formattedOriginalSql: string
  proposedSql: string
  acceptedSql: string
  proposedFixes: ProposedFix[]
  reviewState: ReviewState
  analysis: SqlAnalysis
  findings: ValidationFinding[]
}

export type DeploymentArtifacts = {
  deploymentText: string
  ticketNote: string
}
