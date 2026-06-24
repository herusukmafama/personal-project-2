export type MarkdownNotesInput = {
  title: string
  summary: string
  mrLink: string
  appsetting: string
  dbName: string
  backupScript: string
  deploymentScript: string
  verificationQuery: string
  rollbackQuery: string
  notes: string
}

export type MarkdownPreviewBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; language: string; content: string }
  | { type: 'divider' }

export const emptyMarkdownNotesInput: MarkdownNotesInput = {
  title: '',
  summary: '',
  mrLink: '',
  appsetting: '',
  dbName: '',
  backupScript: '',
  deploymentScript: '',
  verificationQuery: '',
  rollbackQuery: '',
  notes: '',
}
