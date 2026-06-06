import type {
  DeploymentArtifacts,
  DeploymentMetadata,
  SqlFileResult,
  ValidationFinding,
} from './types'

export function generateArtifacts(
  metadata: DeploymentMetadata,
  files: SqlFileResult[],
): DeploymentArtifacts {
  const names = files.map((file) => file.outputName)
  return {
    deploymentText: `env=${metadata.environment}\nfeature=${metadata.feature}\n\n${names.join('\n')}\n`,
    ticketNote: [
      'Database Deployment Request',
      '',
      `Environment: ${metadata.environment}`,
      `Feature: ${metadata.feature}`,
      `Total SQL Files: ${files.length}`,
      '',
      'Please deploy the following SQL files in order:',
      ...names.map((name, index) => `${index + 1}. ${name}`),
    ].join('\n'),
  }
}

export function validateDeployment(
  metadata: DeploymentMetadata,
  files: SqlFileResult[],
): ValidationFinding[] {
  const findings: ValidationFinding[] = []
  if (!metadata.environment) findings.push({ code: 'missing-environment', severity: 'error', message: 'Environment is required.' })
  if (!metadata.feature.trim()) findings.push({ code: 'missing-feature', severity: 'error', message: 'Feature is required.' })
  if (!metadata.database.trim()) findings.push({ code: 'missing-database', severity: 'error', message: 'Database/project is required.' })
  if (!files.length) findings.push({ code: 'missing-files', severity: 'error', message: 'Upload at least one SQL file.' })
  files.forEach((file) => {
    if (!isValidOutputName(file.outputName)) {
      findings.push({
        code: `invalid-output-name-${file.id}`,
        severity: 'error',
        message: `${file.originalName} needs a complete guideline-compliant output filename.`,
      })
    }
  })
  const names = files.map((file) => file.outputName.toLowerCase())
  if (new Set(names).size !== names.length) findings.push({ code: 'duplicate-names', severity: 'error', message: 'Output filenames must be unique.' })
  return findings
}

export function isValidOutputName(fileName: string) {
  const regular = /^\d+_[A-Za-z0-9._-]+_[A-Za-z0-9._-]+_[A-Za-z0-9._-]+_(?:CRSCM|DRSCM|CRTBL|DRTBL|ALTBL|CRVW|DRVW|INSTBL|UPTBL|DLTBL|CRTGR|DRTGR|CRIDX|DRIDX)\.sql$/i
  const functionName = /^\d+_[A-Za-z0-9._-]+_[A-Za-z0-9._-]+_[A-Za-z0-9._-]+_P\d+_(?:CRFUN|DRFUN)\.sql$/i
  return regular.test(fileName.trim()) || functionName.test(fileName.trim())
}
