# DOCX to JSON V2

DOCX to JSON V2 is a browser-only converter for the Help & Support
`040002.json` structure.

## How It Works

1. Open **DOCX to JSON V2** in the OpenTools Portal.
2. Download `help-support-040002-template.docx`.
3. Fill only the **Value** column in the Word template.
4. Remove rows you do not need for the current case.
5. Keep the **JSON Path** column unchanged for rows you keep.
6. Upload the edited `.docx` file.
7. Review the JSON preview and download the generated `.json` file.

## Template Rules

- The template is identified by `DOCX_TO_JSON_V2_040002`.
- Deleted rows are omitted from the generated JSON.
- Empty **Value** cells are generated as blank text.
- The generated JSON follows the same Help & Support structure for the rows
  that remain in the Word file:
  - `page_title`
  - `breadcrumb`
  - `page_content.type`
  - `page_content.navigations`
  - `page_content.section`
- Descriptions can contain rich Word content. The converter stores description
  cells as HTML so Help & Support content can keep paragraphs and basic
  formatting.

## Privacy

The Word file is processed locally in the browser. The portal does not upload,
store, or send the document to a backend, API, or database.
