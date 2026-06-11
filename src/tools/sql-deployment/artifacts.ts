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
      'Dear Mas @idc_hardy,',
      `Mohon bantuan deployment untuk fixing SPLC ${formatFeatureTitle(metadata.feature)}.`,
      '',
      `Environment: ${metadata.environment}`,
      `Database: ${metadata.database}`,
      `Feature/Branch: ${metadata.feature}`,
      '',
      'List file SQL sesuai urutan deployment:',
      ...names.map((name, index) => `${index + 1}. ${name}`),
      '',
      'Catatan:',
      '- Branch/folder sudah dilakukan cleansing untuk kebutuhan fixing.',
      '- deployment.txt sudah disesuaikan dengan file SQL yang akan dideploy.',
    ].join('\n'),
  }
}

function formatFeatureTitle(feature: string) {
  const tokens = feature.trim().split('_').filter(Boolean)
  if (!tokens.length) return ''

  return tokens.map(formatFeatureToken).join(' ')
}

function formatFeatureToken(token: string) {
  const acronymMap: Record<string, string> = {
    spv: 'SPV',
    headops: 'HeadOps',
    slrc: 'SLRC',
    splc: 'SPLC',
    idc: 'IDC',
  }
  const normalized = token.toLowerCase()
  return acronymMap[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1)
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
    if (file.reviewState === 'needs-review') {
      findings.push({
        code: `pending-review-${file.id}`,
        severity: 'error',
        message: `${file.originalName} has proposed SQL changes that must be reviewed.`,
      })
    }
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
