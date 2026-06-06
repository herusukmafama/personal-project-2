export type ParserMessage = {
  type: string
  message: string
}

export type ParsedDocument = {
  fileName: string
  fileSize: number
  html: string
  text: string
  metadata: Record<string, string>
  messages: ParserMessage[]
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
}

export type HelpSupportJson = {
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
