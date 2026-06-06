# DOCX to JSON React Migration

## Migration Plan

1. Preserve the complete previous browser application under `legacy/`.
2. Move DOCX validation and Mammoth parsing into `docxParser.ts`.
3. Move the existing Help & Support mapping algorithm into `jsonMapper.ts`.
4. Move JSON filename generation and browser download behavior into `downloadJson.ts`.
5. Replace DOM event orchestration with React state in `DocxToJsonTool.tsx`.
6. Verify the TypeScript build, lint rules, and existing sample fixtures.

## New Structure

```text
src/tools/docx-to-json/
|-- DocxToJsonTool.tsx
|-- docxParser.ts
|-- jsonMapper.ts
|-- downloadJson.ts
`-- types.ts

legacy/
|-- assets/
|-- docs/
|-- lib/
|-- samples/
|-- index.html
|-- README.md
|-- CHANGELOG.md
`-- AGENTS.md
```

## Behavior Parity

- DOCX validation messages, supported MIME type, and 10 MB limit are unchanged.
- Mammoth style mapping and metadata-table extraction are unchanged.
- JSON mapping order, fixed values, marker handling, HTML serialization, image
  naming, PDF naming, and output shape are unchanged.
- Downloaded JSON still uses two-space indentation and replaces `.docx` with
  `.json`.
- Selecting or dropping a valid DOCX now starts conversion immediately; the
  mapping and output behavior remain unchanged.
- All processing remains browser-only with no API, backend, database, upload,
  or browser storage.

The React migration changes UI orchestration only. The legacy mapping algorithm
is retained as a reference in `legacy/assets/js/json-mapper.js`.

Automated parity tests run both the legacy mapper and the TypeScript mapper
against the HTML parsed from each legacy DOCX fixture and require deep-equal JSON
output.
