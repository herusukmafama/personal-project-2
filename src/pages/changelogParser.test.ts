import { describe, expect, it } from 'vitest'
import { parseChangelogMarkdown } from './changelogParser'

describe('parseChangelogMarkdown', () => {
  it('parses released changelog entries from CHANGELOGS.md format', () => {
    const entries = parseChangelogMarkdown(`
# Changelogs

## Released - Compare Text Tool - 2026-06-17

Added a browser-only text comparison tool.

### Updates

- Added **Compare Text** as a new dashboard and sidebar tool.
- Added automatic text-type detection for SQL, JSON, XML/HTML, Markdown,
  CSV/TSV, and plain text.

## Released - Built With Page - 2026-06-08

Added a portfolio-friendly page.
`)

    expect(entries).toEqual([
      {
        date: '2026-06-17',
        title: 'Compare Text Tool',
        description: 'Added a browser-only text comparison tool.',
        items: [
          'Added **Compare Text** as a new dashboard and sidebar tool.',
          'Added automatic text-type detection for SQL, JSON, XML/HTML, Markdown, CSV/TSV, and plain text.',
        ],
      },
      {
        date: '2026-06-08',
        title: 'Built With Page',
        description: 'Added a portfolio-friendly page.',
        items: [],
      },
    ])
  })
})

