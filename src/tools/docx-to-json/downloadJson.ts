export function buildDownloadFileName(fileName: string) {
  return String(fileName || 'converted.docx').replace(/\.docx$/i, '.json')
}

export function downloadJson(value: unknown, fileName: string) {
  const jsonText = JSON.stringify(value, null, 2)
  const blob = new Blob([jsonText], {
    type: 'application/json;charset=utf-8',
  })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = downloadUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(downloadUrl)
}
