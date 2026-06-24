import { describe, expect, it, vi } from 'vitest'
import { generateMarkdown, generateMarkdownFileName } from './generateMarkdown'
import { parseMarkdownPreview } from './renderMarkdown'
import { clearDraft, loadDraft, MARKDOWN_NOTES_DRAFT_KEY, saveDraft } from './storage'
import type { MarkdownNotesInput } from './types'

const completeInput: MarkdownNotesInput = {
  title: 'Workflow PIC Internal Notification',
  summary: 'Prepare deployment notes for notification workflow.',
  mrLink: 'https://github.com/example/repo/pull/12',
  appsetting: '{\n  "enabled": true\n}',
  dbName: 'idc-collection-v2',
  backupScript: 'CREATE TABLE backup_table AS SELECT * FROM source_table;',
  deploymentScript: 'ALTER TABLE source_table ADD COLUMN status text;',
  verificationQuery: 'SELECT status FROM source_table LIMIT 1;',
  rollbackQuery: 'ALTER TABLE source_table DROP COLUMN status;',
  notes: 'Deploy during the agreed release window.',
}

describe('generateMarkdown', () => {
  it('generates the deployment notes markdown template', () => {
    expect(generateMarkdown(completeInput)).toBe(`# Workflow PIC Internal Notification

## Summary

Prepare deployment notes for notification workflow.

---

## MR

https://github.com/example/repo/pull/12

---

## Appsetting

\`\`\`json
{
  "enabled": true
}
\`\`\`

---

## DB Deployment - idc-collection-v2

### Backup Script

\`\`\`sql
CREATE TABLE backup_table AS SELECT * FROM source_table;
\`\`\`

### Deployment Script

\`\`\`sql
ALTER TABLE source_table ADD COLUMN status text;
\`\`\`

---

## Verification Query

\`\`\`sql
SELECT status FROM source_table LIMIT 1;
\`\`\`

---

## Rollback Query

\`\`\`sql
ALTER TABLE source_table DROP COLUMN status;
\`\`\`

---

## Notes

Deploy during the agreed release window.
`)
  })

  it('keeps blank fields blank for partial notes', () => {
    const markdown = generateMarkdown({ ...completeInput, title: '', appsetting: '', dbName: '' })

    expect(markdown).toContain('# \n')
    expect(markdown).toContain('```json\n\n```')
    expect(markdown).toContain('## DB Deployment - \n')
  })
})

describe('generateMarkdownFileName', () => {
  it('generates a safe deployment notes filename from title', () => {
    expect(generateMarkdownFileName('Workflow PIC Internal Notification')).toBe(
      'deployment-notes-workflow-pic-internal-notification.md',
    )
  })

  it('uses a fallback filename when the title is empty', () => {
    expect(generateMarkdownFileName('   ')).toBe('deployment-notes.md')
  })
})

describe('draft storage', () => {
  it('saves, loads, and clears the draft with the explicit key', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => store.set(key, value)),
      removeItem: vi.fn((key: string) => store.delete(key)),
    }

    saveDraft(completeInput, storage)
    expect(storage.setItem).toHaveBeenCalledWith(MARKDOWN_NOTES_DRAFT_KEY, JSON.stringify(completeInput))
    expect(loadDraft(storage)).toEqual(completeInput)

    clearDraft(storage)
    expect(storage.removeItem).toHaveBeenCalledWith(MARKDOWN_NOTES_DRAFT_KEY)
    expect(loadDraft(storage)).toBeNull()
  })
})

describe('parseMarkdownPreview', () => {
  it('keeps user HTML as text for React to escape during rendering', () => {
    const blocks = parseMarkdownPreview(generateMarkdown({ ...completeInput, notes: '<script>alert(1)</script>' }))

    expect(blocks).toContainEqual({ type: 'paragraph', text: '<script>alert(1)</script>' })
  })
})
