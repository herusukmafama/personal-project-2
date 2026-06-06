import type { HelpSupportJson, ParsedDocument } from './types'

const DEFAULT_FEATURE_BREADCRUMB = {
  label: 'Features',
  url: 'main/030000',
}

type ImageState = { nextOrder: number }
type MappedItem = Record<string, unknown>

export function mapParsedDocumentToJson(
  parsedDocument: ParsedDocument,
): HelpSupportJson {
  const htmlDocument = new DOMParser().parseFromString(
    parsedDocument.html,
    'text/html',
  )
  const contentElements = getContentElements(htmlDocument)
  const metadata = parsedDocument.metadata || {}
  const pageTitle =
    metadata.features ||
    textOf(findFirst(contentElements, 'h1')) ||
    getBaseFileName(parsedDocument.fileName)
  const docNumber = metadata.docNumber || ''
  const overviewSection = buildOverviewSection(
    contentElements,
    pageTitle,
    docNumber,
  )
  const fullDocumentationSection = buildFullDocumentationSection(
    pageTitle,
    docNumber,
  )

  return {
    page_title: pageTitle,
    breadcrumb: buildBreadcrumb(pageTitle, docNumber),
    page_content: {
      type: 'content',
      navigations: [
        {
          label: 'Overview',
          id: 'overview',
        },
      ],
      section: [overviewSection, fullDocumentationSection],
    },
  }
}

function getContentElements(htmlDocument: Document) {
  const clonedBody = htmlDocument.body.cloneNode(true) as HTMLBodyElement
  const metadataTable = clonedBody.querySelector('table')

  if (metadataTable) {
    metadataTable.remove()
  }

  return Array.from(clonedBody.children).filter(
    (element) =>
      textOf(element) ||
      element.matches('img, ul, ol') ||
      element.querySelector('img'),
  )
}

function buildBreadcrumb(pageTitle: string, docNumber: string) {
  return [
    {
      label: 'Help and Support',
      url: 'helpAndSupport',
    },
    DEFAULT_FEATURE_BREADCRUMB,
    {
      label: pageTitle,
      url: docNumber,
    },
  ]
}

function buildOverviewSection(
  elements: Element[],
  pageTitle: string,
  docNumber: string,
) {
  const firstHeadingIndex = elements.findIndex((element) =>
    element.matches('h1'),
  )
  const firstHeading =
    firstHeadingIndex >= 0 ? elements[firstHeadingIndex] : null
  const headingText = textOf(firstHeading) || pageTitle
  const firstChildHeadingIndex = findNextHeadingIndex(
    elements,
    firstHeadingIndex + 1,
    'h2',
  )
  const descriptionBlocks =
    firstHeadingIndex >= 0
      ? elements
          .slice(
            firstHeadingIndex + 1,
            firstChildHeadingIndex >= 0
              ? firstChildHeadingIndex
              : elements.length,
          )
          .filter(isContentBlock)
      : []
  const data: MappedItem[] = []
  const imageState = { nextOrder: 1 }

  for (
    let index = firstChildHeadingIndex;
    index >= 0 && index < elements.length;
    index += 1
  ) {
    const element = elements[index]

    if (!element.matches('h2')) {
      continue
    }

    const title = textOf(element)

    if (equalsIgnoreCase(title, 'Feature')) {
      const nextIndex = findNextHeadingIndex(elements, index + 1, 'h2')
      const blocks = elements
        .slice(index + 1, nextIndex >= 0 ? nextIndex : elements.length)
        .filter(isContentBlock)

      data.push({
        title,
        id: '',
        description: serializeBlocksAsParagraph(blocks),
        data: [],
      })
      continue
    }

    if (equalsIgnoreCase(title, 'Table Configuration Guide')) {
      data.push(buildGuideSection(elements, index, docNumber, imageState))
      continue
    }

    if (
      equalsIgnoreCase(title, 'How To Use') &&
      data.some(
        (item) =>
          typeof item.title === 'string' &&
          equalsIgnoreCase(item.title, 'Table Configuration Guide'),
      )
    ) {
      continue
    }

    data.push(buildGenericContentSection(elements, index, docNumber, imageState))
  }

  return {
    title: headingText,
    id: 'overview',
    description: serializeStandaloneBlocks(descriptionBlocks),
    data,
  }
}

function buildGenericContentSection(
  elements: Element[],
  headingIndex: number,
  docNumber: string,
  imageState: ImageState,
) {
  const title = textOf(elements[headingIndex])
  const nextIndex = findNextHeadingIndex(elements, headingIndex + 1, 'h2')
  const blocks = elements.slice(
    headingIndex + 1,
    nextIndex >= 0 ? nextIndex : elements.length,
  )
  const descriptionBlocks = blocks.filter(
    (block) => isContentBlock(block) && !hasImage(block),
  )
  const imageItems = blocks
    .filter(hasImage)
    .map(() => buildImageItem(docNumber, imageState.nextOrder++))

  return {
    title,
    id: '',
    description: serializeStandaloneBlocks(descriptionBlocks),
    data: imageItems,
  }
}

function buildGuideSection(
  elements: Element[],
  headingIndex: number,
  docNumber: string,
  imageState: ImageState,
) {
  const guideData: MappedItem[] = []
  let cursor = headingIndex + 1

  while (cursor < elements.length) {
    const element = elements[cursor]
    const text = textOf(element)

    if (element.matches('h2') && !equalsIgnoreCase(text, 'How To Use')) {
      break
    }

    if (hasImage(element)) {
      guideData.push(buildImageItem(docNumber, imageState.nextOrder++))
      cursor += 1
      continue
    }

    if (isMarker(text, 'Tips')) {
      const collected = collectUntilMarker(elements, cursor + 1, 'End Tips')
      guideData.push({
        title: 'Tips',
        description: serializeStandaloneBlocks(collected.blocks),
        order: 3,
        type: 'tips',
      })
      cursor = collected.nextIndex
      continue
    }

    if (isMarker(text, 'Limitation')) {
      const collected = collectUntilMarker(
        elements,
        cursor + 1,
        'End Limitation',
      )
      guideData.push({
        title: 'Limitation',
        description: serializeBlocksAsParagraph(collected.blocks),
        order: 2,
        type: 'forbidden',
      })
      cursor = collected.nextIndex
      continue
    }

    if (element.matches('h2') && equalsIgnoreCase(text, 'How To Use')) {
      const collected = collectUntilAny(elements, cursor + 1, (candidate) =>
        isMarker(textOf(candidate), 'Limitation'),
      )
      guideData.push({
        title: '',
        description: serializeBlocksAsParagraph(collected.blocks, {
          orderedListType: '1',
        }),
        order: 1,
        links: [],
        type: 'document',
      })
      cursor = collected.nextIndex
      continue
    }

    if (isContentBlock(element)) {
      const collected = collectUntilAny(elements, cursor, (candidate) => {
        const candidateText = textOf(candidate)
        return (
          candidate.matches('h2') ||
          hasImage(candidate) ||
          isMarker(candidateText, 'Tips') ||
          isMarker(candidateText, 'Limitation')
        )
      })

      if (collected.blocks.length) {
        guideData.push({
          title: '',
          description: serializeBlocksAsParagraph(collected.blocks),
          order: 2,
          links: [],
          type: 'document',
        })
      }

      cursor = Math.max(collected.nextIndex, cursor + 1)
      continue
    }

    cursor += 1
  }

  return {
    title: 'Table Configuration Guide',
    id: '',
    description: '',
    data: guideData,
  }
}

function buildImageItem(docNumber: string, order: number) {
  return {
    title: '',
    description: '',
    order,
    image: [
      {
        url: `${docNumber}-figure-${String(order).padStart(2, '0')}.png`,
        notes: '',
      },
    ],
    type: 'image',
  }
}

function buildFullDocumentationSection(pageTitle: string, docNumber: string) {
  return {
    title: '',
    id: '',
    description: '',
    data: [
      {
        title: 'Full Documentation',
        id: '',
        description: 'Untuk informasi detail, silakan akses dokumen berikut',
        data: [
          {
            url: `${docNumber}-${slugForFileName(pageTitle)}.pdf`,
            label: pageTitle,
          },
        ],
      },
    ],
  }
}

function collectUntilMarker(
  elements: Element[],
  startIndex: number,
  markerTitle: string,
) {
  const collected = collectUntilAny(elements, startIndex, (element) =>
    isMarker(textOf(element), markerTitle),
  )
  const nextIndex =
    collected.nextIndex < elements.length
      ? collected.nextIndex + 1
      : collected.nextIndex

  return {
    blocks: collected.blocks,
    nextIndex,
  }
}

function collectUntilAny(
  elements: Element[],
  startIndex: number,
  stopPredicate: (element: Element) => boolean,
) {
  const blocks: Element[] = []
  let index = startIndex

  while (index < elements.length) {
    const element = elements[index]

    if (stopPredicate(element)) {
      break
    }

    if (isContentBlock(element)) {
      blocks.push(element)
    }

    index += 1
  }

  return {
    blocks,
    nextIndex: index,
  }
}

function serializeStandaloneBlocks(blocks: Element[]) {
  return blocks.map((block) => normalizeHtml(block.outerHTML)).join('')
}

function serializeBlocksAsParagraph(
  blocks: Element[],
  options: { orderedListType?: string } = {},
) {
  const content = blocks
    .map((block) => {
      if (block.matches('p')) {
        return normalizeHtml(block.innerHTML)
      }

      if (block.matches('ol') && options.orderedListType) {
        const clone = block.cloneNode(true) as Element
        clone.setAttribute('type', options.orderedListType)
        return normalizeHtml(clone.outerHTML)
      }

      return normalizeHtml(block.outerHTML)
    })
    .filter(Boolean)
    .join(' ')

  return content ? `<p>${content}</p>` : ''
}

function normalizeHtml(value: unknown) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/>\s+</g, '> <')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function isContentBlock(element: Element) {
  return (
    element.matches('p, ul, ol, table') &&
    Boolean(textOf(element) || hasImage(element))
  )
}

function hasImage(element: Element | null) {
  return Boolean(
    element && (element.matches('img') || element.querySelector('img')),
  )
}

function findFirst(elements: Element[], selector: string) {
  return elements.find((element) => element.matches(selector)) || null
}

function findNextHeadingIndex(
  elements: Element[],
  startIndex: number,
  selector: string,
) {
  for (
    let index = Math.max(startIndex, 0);
    index < elements.length;
    index += 1
  ) {
    if (elements[index].matches(selector)) {
      return index
    }
  }

  return -1
}

function isMarker(value: string, markerTitle: string) {
  const normalized = normalizeText(value).replace(/\*/g, '').replace(/:$/g, '')
  return equalsIgnoreCase(normalized, markerTitle)
}

function equalsIgnoreCase(left: string, right: string) {
  return normalizeText(left).toLowerCase() === normalizeText(right).toLowerCase()
}

function textOf(element: Element | null) {
  return element ? normalizeText(element.textContent) : ''
}

function normalizeText(value: unknown) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getBaseFileName(fileName: string) {
  return String(fileName || 'converted')
    .replace(/\.[^.]+$/, '')
    .trim()
}

function slugForFileName(value: string) {
  return normalizeText(value)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
