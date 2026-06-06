# DOCX to JSON Converter

Local browser-based application for converting uploaded `.docx` files into JSON using predefined Help & Support mapping rules.

This project implements a browser-only MVP for converting Help & Support `.docx` templates into JSON. It intentionally does not include backend code, database code, authentication, API calls, or file storage.

Public demo:

[https://herusukmafama.github.io/personal-project-1/](https://herusukmafama.github.io/personal-project-1/)

## Technology Stack

- HTML5
- Bootstrap 5
- JavaScript ES6
- Mammoth.js browser bundle

## Architecture Principles

- Keep all processing in the browser.
- Keep UI orchestration separate from DOCX parsing.
- Keep DOCX parsing separate from JSON mapping.
- Keep mapping rules documented beside the implementation.
- Keep sample input and sample output files separate.
- Prepare for future template-based parsing.

## Folder and File Responsibilities

- `index.html`: Browser entry page for upload, preview, and download controls.
- `AGENTS.md`: Contributor and agent guidance for architecture, standards, and review checks.
- `CHANGELOG.md`: User-visible change history.
- `.gitignore`: Local OS, editor, tooling, and temporary artifact exclusions.
- `assets/`: Frontend assets owned by the application.
- `assets/css/style.css`: Application-specific styling only.
- `assets/js/app.js`: UI orchestration module.
- `assets/js/parser.js`: DOCX validation and parsing boundary using Mammoth.js.
- `assets/js/json-mapper.js`: Help & Support transformation boundary from parsed content to target JSON.
- `lib/`: Third-party browser libraries vendored locally.
- `lib/bootstrap.min.css`: Local Bootstrap CSS for offline usage.
- `lib/mammoth.browser.min.js`: Local Mammoth.js browser bundle for DOCX HTML extraction.
- `samples/`: Sample fixtures for parser and mapper validation.
- `samples/word/`: `.docx` input samples.
- `samples/word/sample_01.docx`: Current Word sample file.
- `samples/word/README.md`: Notes for Word sample ownership and usage.
- `samples/json/`: Expected JSON output samples.
- `samples/json/sample_01.json`: Current expected JSON output file.
- `samples/json/README.md`: Notes for JSON sample ownership and usage.
- `docs/`: Product and technical documentation.
- `docs/PRD.md`: Product requirements and non-goals.
- `docs/JSON_SCHEMA.md`: Target JSON contract documentation.
- `docs/MAPPING_RULE.md`: DOCX-to-JSON mapping rule documentation.
- `README.md`: Project overview, structure, and responsibilities.

## Current Project Tree

```text
docx-to-json-converter/
|-- index.html
|-- AGENTS.md
|-- CHANGELOG.md
|-- .gitignore
|-- assets/
|   |-- css/
|   |   `-- style.css
|   `-- js/
|       |-- app.js
|       |-- parser.js
|       `-- json-mapper.js
|-- lib/
|   |-- bootstrap.min.css
|   `-- mammoth.browser.min.js
|-- samples/
|   |-- word/
|   |   |-- 030175-DF Bulk Decisioning BC Score.docx
|   |   |-- sample_01.docx
|   |   `-- README.md
|   `-- json/
|       |-- 030175-DF Bulk Decisioning BC Score.json
|       |-- sample_01.json
|       `-- README.md
|-- docs/
|   |-- PRD.md
|   |-- JSON_SCHEMA.md
|   `-- MAPPING_RULE.md
`-- README.md
```

## Usage

Open `index.html` in Chrome or Edge, choose a `.docx` file, click Convert, preview the generated JSON, then download it as a `.json` file.

## Current Limitations

- The mapper targets the current Help & Support sample template.
- Image files are referenced in JSON but are not extracted or stored.
- JSON Schema validation is documented but not enforced by a validation library yet.

## Next Implementation Phase

Future work can add multiple template support, schema validation, drag-and-drop upload, and batch conversion.
