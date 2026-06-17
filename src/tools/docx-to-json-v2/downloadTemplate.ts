export const TEMPLATE_FILE_NAME = 'help-support-040002-template.docx'

export function getTemplateDownloadUrl() {
  return `${import.meta.env.BASE_URL}templates/${TEMPLATE_FILE_NAME}`
}

