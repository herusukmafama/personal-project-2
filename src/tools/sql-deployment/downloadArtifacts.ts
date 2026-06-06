import JSZip from 'jszip'
import type { DeploymentArtifacts, SqlFileResult } from './types'

export function downloadText(content: string, fileName: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function downloadDeploymentZip(
  feature: string,
  files: SqlFileResult[],
  artifacts: DeploymentArtifacts,
) {
  const bytes = await createDeploymentZip(files, artifacts)
  const safeFeature = feature.trim().replace(/[^A-Za-z0-9_-]/g, '_') || 'sql'
  downloadBlob(new Blob([bytes], { type: 'application/zip' }), `${safeFeature}_deployment.zip`)
}

export async function createDeploymentZip(
  files: SqlFileResult[],
  artifacts: DeploymentArtifacts,
) {
  const zip = new JSZip()
  files.forEach((file) => zip.file(file.outputName, file.acceptedSql))
  zip.file('deployment.txt', artifacts.deploymentText)
  return zip.generateAsync({ type: 'uint8array' })
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
