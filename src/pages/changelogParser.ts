export type ParsedChangelogEntry = {
  date: string
  title: string
  description: string
  items: string[]
}

const RELEASE_HEADING_PATTERN =
  /^## Released - (?<title>.+?) - (?<date>\d{4}-\d{2}-\d{2})\s*$/gm

export function parseChangelogMarkdown(markdown: string) {
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n')
  const matches = Array.from(
    normalizedMarkdown.matchAll(RELEASE_HEADING_PATTERN),
  )

  return matches.map((match, index) => {
    const nextMatch = matches[index + 1]
    const blockStart = (match.index || 0) + match[0].length
    const blockEnd = nextMatch?.index || normalizedMarkdown.length
    const block = normalizedMarkdown.slice(blockStart, blockEnd).trim()

    return {
      date: match.groups?.date || '',
      title: match.groups?.title || '',
      description: extractDescription(block),
      items: extractUpdateItems(block),
    }
  })
}

function extractDescription(block: string) {
  const descriptionBlock = block.split(/\n### /)[0] || ''
  const description = descriptionBlock
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')

  return description || 'See CHANGELOGS.md for the full release notes.'
}

function extractUpdateItems(block: string) {
  const updatesMatch = block.match(
    /(?:^|\n)### Updates\s*\n(?<updates>[\s\S]*?)(?=\n### |\n## |$)/,
  )

  if (!updatesMatch?.groups?.updates) {
    return []
  }

  return collectMarkdownBullets(updatesMatch.groups.updates)
}

function collectMarkdownBullets(markdown: string) {
  const items: string[] = []
  let currentItem = ''

  markdown.split('\n').forEach((line) => {
    if (line.startsWith('- ')) {
      if (currentItem) {
        items.push(currentItem)
      }

      currentItem = line.slice(2).trim()
      return
    }

    if (currentItem && /^\s{2,}\S/.test(line)) {
      currentItem = `${currentItem} ${line.trim()}`
    }
  })

  if (currentItem) {
    items.push(currentItem)
  }

  return items
}

