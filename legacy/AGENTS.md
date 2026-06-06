# AGENTS.md

Guidance for future agents and contributors working on this personal project.

## Project Context

This is a local browser-only DOCX to JSON Converter for Help & Support document templates.

- No backend.
- No API.
- No database.
- No authentication.
- No file storage.
- All processing must run in the browser.
- The public demo is deployed through GitHub Pages from the `main` branch root.

## Technology Stack

- HTML5 for document structure.
- Bootstrap 5 for baseline UI utilities.
- CSS for project-specific styling.
- JavaScript ES6 for browser behavior.
- Mammoth.js browser bundle for DOCX extraction.

## Architecture Rules

- `index.html` owns page structure only.
- `assets/css/style.css` owns presentation only.
- `assets/js/app.js` owns UI orchestration only.
- `assets/js/parser.js` owns file validation and DOCX parsing only.
- `assets/js/json-mapper.js` owns parsed-content to JSON mapping only.
- `lib/` contains vendored third-party browser assets.
- `docs/` contains product and technical documentation.
- `samples/word/` contains representative DOCX input samples.
- `samples/json/` contains expected JSON outputs.

Do not mix responsibilities across these boundaries unless the architecture is deliberately updated and documented.

## Clean Code Standards

- Use clear function names that describe behavior.
- Keep functions small and focused on one responsibility.
- Prefer constants for repeated configuration values.
- Avoid hidden side effects outside UI orchestration.
- Keep DOM lookups centralized in `app.js` when possible.
- Keep mapping rules readable and grouped by template behavior.
- Fail with helpful user-facing messages.
- Avoid broad rewrites when a focused change is enough.

## Browser App Standards

- The app must work from GitHub Pages and from local `index.html`.
- Do not require a development server for normal usage.
- Do not introduce build tools unless there is a clear need.
- Do not add network calls for user DOCX content.
- Do not store uploaded files in browser storage.
- Keep third-party runtime files local when offline usage matters.
- Maintain accessible labels, keyboard-friendly controls, and visible states.
- Keep responsive layout usable on desktop and mobile.

## Mapping Standards

- Preserve existing sample behavior when adding new mapping support.
- Add a DOCX sample and matching expected JSON for new template behavior.
- Prefer template-based rules over brittle text-only hacks.
- Keep generated JSON shape compatible with `docs/JSON_SCHEMA.md`.
- Update `docs/MAPPING_RULE.md` whenever mapping behavior changes.

## Documentation Standards

- Update `README.md` when usage, deployment, or structure changes.
- Update `CHANGELOG.md` for user-visible changes.
- Keep `docs/PRD.md` focused on product intent and acceptance criteria.
- Keep `docs/JSON_SCHEMA.md` focused on output contract.
- Keep `docs/MAPPING_RULE.md` focused on transformation rules.

## Git Standards

- Use small commits with clear messages.
- Verify the converter with the representative samples before pushing.
- Keep generated test artifacts out of git unless they are official samples.
- Do not commit secrets, tokens, local browser profiles, or OS/editor noise.

## Review Checklist

Before finishing a change, check:

- The app still opens from `index.html`.
- DOCX upload, convert, preview, and download still work.
- Existing samples still convert.
- New samples have matching expected JSON when relevant.
- No backend/API/database/auth/storage was introduced.
- Footer, metadata, README, and changelog are current.
- GitHub Pages will still serve the app from repository root.
