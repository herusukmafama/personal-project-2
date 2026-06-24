import { emptyMarkdownNotesInput, type MarkdownNotesInput } from './types'

export const MARKDOWN_NOTES_DRAFT_KEY = 'opentools_markdown_notes_draft'

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function isMarkdownNotesInput(value: unknown): value is MarkdownNotesInput {
  if (!value || typeof value !== 'object') {
    return false
  }

  return Object.keys(emptyMarkdownNotesInput).every(
    (key) => typeof (value as Record<string, unknown>)[key] === 'string',
  )
}

export function loadDraft(storage: DraftStorage = localStorage): MarkdownNotesInput | null {
  try {
    const storedValue = storage.getItem(MARKDOWN_NOTES_DRAFT_KEY)
    if (!storedValue) {
      return null
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    return isMarkdownNotesInput(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

export function saveDraft(input: MarkdownNotesInput, storage: DraftStorage = localStorage) {
  storage.setItem(MARKDOWN_NOTES_DRAFT_KEY, JSON.stringify(input))
}

export function clearDraft(storage: DraftStorage = localStorage) {
  storage.removeItem(MARKDOWN_NOTES_DRAFT_KEY)
}
