import type { MarkdownPreviewBlock } from './types'

export function parseMarkdownPreview(markdown: string): MarkdownPreviewBlock[] {
  const blocks: MarkdownPreviewBlock[] = []
  const lines = markdown.split(/\r?\n/)
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      index += 1
      continue
    }

    const codeFence = trimmedLine.match(/^```(\w*)$/)
    if (codeFence) {
      const language = codeFence[1] ?? ''
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && lines[index].trim() !== '```') {
        codeLines.push(lines[index])
        index += 1
      }

      blocks.push({ type: 'code', language, content: codeLines.join('\n') })
      index += 1
      continue
    }

    const heading = trimmedLine.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      })
      index += 1
      continue
    }

    if (trimmedLine === '---') {
      blocks.push({ type: 'divider' })
      index += 1
      continue
    }

    const paragraphLines = [line]
    index += 1

    while (index < lines.length) {
      const nextLine = lines[index]
      const nextTrimmedLine = nextLine.trim()
      if (
        !nextTrimmedLine ||
        nextTrimmedLine === '---' ||
        nextTrimmedLine.startsWith('#') ||
        nextTrimmedLine.startsWith('```')
      ) {
        break
      }

      paragraphLines.push(nextLine)
      index += 1
    }

    blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') })
  }

  return blocks
}
