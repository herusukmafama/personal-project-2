# Mapping Rules - Help & Support DOCX Template

## Purpose

This file documents how the converter maps a Help & Support `.docx` file into the target JSON structure.

## Source Template Assumptions

The current mapper expects a Word document with:

- A metadata table at the beginning of the document.
- A main `Heading 1` used as the overview section title.
- `Heading 2` blocks for content groups.
- Inline Word formatting that Mammoth.js can convert to HTML.
- Marker paragraphs for special callouts:
  - `**Tips:**`
  - `**End Tips**`
  - `**Limitation:**`
  - `**End Limitation**`

## Metadata Table Mapping

| DOCX Label | JSON Usage |
| --- | --- |
| Features | `page_title`, current breadcrumb label, main section title |
| Doc Number | current breadcrumb URL, image URL prefix, PDF URL prefix |
| Category | Reserved for future routing/template rules |
| Description | Reserved fallback metadata |
| PIC | Reserved metadata |
| Sheets | Reserved metadata |

## Breadcrumb Mapping

The converter generates this fixed breadcrumb shape:

```json
[
  {
    "label": "Help and Support",
    "url": "helpAndSupport"
  },
  {
    "label": "Features",
    "url": "main/030000"
  },
  {
    "label": "{Features}",
    "url": "{Doc Number}"
  }
]
```

## Overview Section

The first `Heading 1` becomes:

```json
{
  "title": "{Heading 1}",
  "id": "overview",
  "description": "{HTML content until first Heading 2}",
  "data": []
}
```

## Feature Section

`Heading 2 = Feature` becomes a standard content item:

```json
{
  "title": "Feature",
  "id": "",
  "description": "{paragraph and list HTML after the heading}",
  "data": []
}
```

## Table Configuration Guide Section

`Heading 2 = Table Configuration Guide` becomes a nested guide object.

Images under this section map to:

```text
{Doc Number}-figure-{2 digit order}.png
```

Example:

```text
core/050073-figure-01.png
```

Paragraph/list content before `Tips` maps to `type: document` with `order: 2`.

`**Tips:**` content maps to:

```json
{
  "title": "Tips",
  "order": 3,
  "type": "tips"
}
```

`Heading 2 = How To Use` maps into the existing Table Configuration Guide data as `type: document` with `order: 1`.

`**Limitation:**` content maps to:

```json
{
  "title": "Limitation",
  "order": 2,
  "type": "forbidden"
}
```

## Full Documentation Section

The mapper always appends a Full Documentation section.

The PDF URL uses:

```text
{Doc Number}-{Features with spaces replaced by hyphen}.pdf
```

Example:

```text
core/050073-Job-Data-Syncronization.pdf
```

## Current Limitations

- The mapper is template-based, not a general-purpose DOCX semantic parser.
- It does not extract image files from DOCX.
- It does not validate against a formal JSON Schema library yet.
- It does not support batch conversion yet.
