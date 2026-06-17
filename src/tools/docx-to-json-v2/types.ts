export type ParserMessage = {
  type: string
  message: string
}

export type ParsedTemplateDocument = {
  fileName: string
  fileSize: number
  html: string
  text: string
  metadata: Record<string, string>
  messages: ParserMessage[]
}

export type HelpSupportTemplateJson = {
  page_title: string
  breadcrumb: Array<{
    label: string
    url: string
  }>
  page_content: {
    type: string
    navigations: Array<{
      label: string
      id: string
    }>
    section: unknown[]
  }
}

