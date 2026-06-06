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

export type SqlFileResult = {
  id: string
  originalName: string
  outputName: string
  originalSql: string
  formattedSql: string
  analysis: SqlAnalysis
  findings: ValidationFinding[]
}

export type DeploymentArtifacts = {
  deploymentText: string
  ticketNote: string
}
