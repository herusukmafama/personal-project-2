import type { MarkdownNotesInput } from './types'

function safeValue(value: string) {
  return value ?? ''
}

export function generateMarkdown(input: MarkdownNotesInput) {
  return `# ${safeValue(input.title)}

## Summary

${safeValue(input.summary)}

---

## MR

${safeValue(input.mrLink)}

---

## Appsetting

\`\`\`json
${safeValue(input.appsetting)}
\`\`\`

---

## DB Deployment - ${safeValue(input.dbName)}

### Backup Script

\`\`\`sql
${safeValue(input.backupScript)}
\`\`\`

### Deployment Script

\`\`\`sql
${safeValue(input.deploymentScript)}
\`\`\`

---

## Verification Query

\`\`\`sql
${safeValue(input.verificationQuery)}
\`\`\`

---

## Rollback Query

\`\`\`sql
${safeValue(input.rollbackQuery)}
\`\`\`

---

## Notes

${safeValue(input.notes)}
`
}

export function generateMarkdownFileName(title: string) {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug ? `deployment-notes-${slug}.md` : 'deployment-notes.md'
}
