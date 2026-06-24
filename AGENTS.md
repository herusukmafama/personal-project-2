# AGENTS.md

Guidance for future agents and contributors working on the OpenTools
Portal.

## Project Context

This repository contains a browser-only OpenTools dashboard designed for
simple, friendly workflows that can be used by technical and non-technical
users.

Current tools:

- DOCX to JSON Converter for Help & Support document templates.
- DOCX to JSON V2 for generating the Help & Support `040002.json` structure
  from a downloadable Word template.
- Compare Text for browser-only side-by-side and unified text diffs.
- Markdown Notes for generating deployment notes, GitHub Issue content, release
  checklists, and daily work documentation as Markdown files.
- SQL Deployment Formatter for preparing SLRC-ready PostgreSQL deployment
  artifacts.
- ARJUNA Installment Simulator for Effective Rate and Flat Rate installment
  schedules.

Core constraints:

- No backend.
- No external API for user content.
- No database.
- No authentication.
- No uploaded-file storage.
- All user-file processing and calculations must run in the browser.
- `localStorage` is allowed only for theme, language, and the Markdown Notes
  draft preference listed in Architecture Rules.
- The public application is deployed to GitHub Pages from the `main` branch.

## Technology Stack

- **React 19** builds the component-based user interface.
- **TypeScript** provides typed application, calculation, parsing, and artifact
  generation logic.
- **Vite 7** provides the development server and production build.
- **Tailwind CSS 4** provides responsive styling, light mode, and dark mode.
- **React Router** provides client-side routes using `HashRouter` for GitHub
  Pages compatibility.
- **Mammoth.js** extracts DOCX content in the browser.
- **sql-formatter** formats PostgreSQL SQL without intentionally changing SQL
  behavior.
- **JSZip** creates browser-generated SQL deployment ZIP files.
- **diff** generates SQL review differences.
- **Vitest** tests business logic and important UI output.
- **ESLint** enforces code-quality rules.
- **GitHub Actions** builds and deploys the application to GitHub Pages.

Do not introduce Bootstrap, jQuery, a backend, an API, a database, or another
frontend framework unless the project architecture is deliberately changed and
documented.

## Project Structure

- `src/components/` contains reusable portal layout and visual components.
- `src/pages/` contains route-level page components.
- `src/i18n/` contains language translations and theme/language preferences.
- `src/tools/docx-to-json/` owns DOCX parsing, JSON mapping, downloads, UI, and
  parity tests.
- `src/tools/docx-to-json-v2/` owns the template-driven DOCX to JSON V2 flow
  for the `040002.json` Help & Support structure, including partial Word
  templates.
- `src/tools/compare-text/` owns text detection, normalization, diff summary,
  and the Compare Text UI.
- `src/tools/markdown-notes/` owns Markdown note generation, safe preview
  parsing, downloads, draft storage, UI, and tests.
- `src/tools/sql-deployment/` owns SQL formatting, analysis, guideline review,
  artifact generation, downloads, UI, and tests.
- `src/tools/installment-simulator/` owns ARJUNA calculation logic, UI, shared
  types, and tests.
- `docs/` contains product documentation and legacy reference files.
- `legacy/` contains preserved legacy application references.
- `CHANGELOGS.md` documents user-visible releases and planned improvements.

Keep business logic separate from React UI whenever practical. Calculation,
parsing, mapping, validation, and artifact-generation functions should remain
testable without rendering components.

## Architecture Rules

- Use existing React, TypeScript, Tailwind, and routing patterns.
- Keep route-level composition in `src/pages/`.
- Keep shared layout behavior in `src/components/`.
- Keep each tool's business logic inside its own `src/tools/<tool-name>/`
  module.
- Preserve existing tool output formats and business rules unless the user
  explicitly requests a behavior change.
- Keep uploaded files and generated artifacts in browser memory only.
- Do not send user content over the network.
- Use the existing preferences context for theme and language support.
- Use only these localStorage keys:
  - `personal_tools_theme`
  - `personal_tools_language`
  - `opentools_markdown_notes_draft`
- Preserve legacy reference files when migrating behavior until parity is
  verified.

## Clean Code Standards

- Use clear names that describe behavior and intent.
- Keep functions small and focused.
- Prefer typed pure functions for calculations, parsing, mapping, validation,
  and artifact generation.
- Prefer constants for repeated configuration.
- Avoid hidden side effects.
- Avoid mixing UI rendering with business logic.
- Provide friendly, actionable error and validation messages.
- Keep content understandable for non-technical users.
- Avoid broad rewrites when a focused change is enough.

## SOLID Principles

Apply SOLID principles pragmatically. Do not over-engineer small utilities, but
keep the code easy to extend, test, and review.

- **Single Responsibility Principle:** each component, hook, parser, mapper,
  validator, and download helper should have one clear reason to change.
- **Open/Closed Principle:** prefer extending behavior through new helpers,
  configuration, or focused modules instead of rewriting stable business logic.
- **Liskov Substitution Principle:** shared types and helper contracts should be
  safe to reuse across tools without surprising behavior changes.
- **Interface Segregation Principle:** keep public types and props focused; do
  not force components or helpers to depend on fields they do not use.
- **Dependency Inversion Principle:** keep business logic independent from React
  UI and browser APIs when practical; pass dependencies into pure helpers when
  doing so improves testability.

## SonarQube-Style Quality Standards

The project may not always run SonarQube locally, but code should be written as
if it must pass a SonarQube quality gate.

- Avoid code smells such as duplicated branches, unused exports, dead code,
  unclear names, overly broad functions, and hidden side effects.
- Keep cognitive complexity low by using early returns, small helpers, and
  shallow control flow.
- Avoid copy-paste duplication; extract shared helpers only when the abstraction
  is clear and useful.
- Treat TypeScript and ESLint warnings as quality issues to resolve before
  finishing.
- Do not ignore errors silently; return friendly, actionable messages for
  expected user-facing failures.
- Avoid unsafe DOM APIs, `eval`, dynamic script injection, and unnecessary
  network access.
- Validate and sanitize file names, generated downloads, and user-provided text
  where they affect rendered output or downloadable artifacts.
- Keep tests focused on changed business rules, edge cases, and regression-prone
  behavior.
- Remove temporary logs, debugging code, commented-out code, and unused assets
  before finishing.

## UI And Accessibility Standards

- Maintain the existing modern SaaS dashboard style.
- Support responsive layouts for desktop and mobile.
- Support light and dark mode.
- Support Indonesian and English content for primary navigation and user-facing
  tool content.
- Use accessible labels, keyboard-friendly controls, visible focus states, and
  clear status messages.
- Prefer automatic, guided workflows when they reduce confusion for
  non-technical users.
- Keep tables readable and horizontally scrollable on small screens.
- Do not rely on color alone to communicate important states.

## Tool-Specific Standards

### DOCX To JSON

- Preserve existing JSON output shape and mapping behavior.
- Keep parsing logic in `docxParser.ts`.
- Keep mapping logic in `jsonMapper.ts`.
- Keep download logic in `downloadJson.ts`.
- Update mapping documentation and parity tests when mapping rules change.

### DOCX To JSON V2

- Keep DOCX to JSON V2 separate from the existing DOCX to JSON mapper.
- Use the base `040002.json` as a reference, but allow uploaded Word templates
  to omit unused rows or sections.
- Treat missing Word template rows as omitted output.
- Treat present rows with empty `Value` cells as blank string output.
- Keep the downloadable Word template aligned with the V2 mapper and tests.

### Compare Text

- Keep comparison, detection, normalization, and summary logic in pure
  TypeScript helpers.
- Keep normalization opt-in; do not silently rewrite user text before compare.
- Use browser-memory file reading only and do not store compared text.
- Preserve side-by-side and unified diff behavior unless the user explicitly
  requests merge-editor behavior.

### Markdown Notes

- Keep Markdown generation, filename generation, downloads, storage, and preview
  parsing in typed helpers.
- Use `opentools_markdown_notes_draft` as the only draft storage key.
- Do not send Markdown notes, appsetting values, SQL scripts, or MR links over
  the network.
- Escape user-provided content through React rendering; do not use
  `dangerouslySetInnerHTML` for the preview.
- Preserve the Markdown output template unless the user explicitly requests a
  template change.

### SQL Deployment Formatter

- Preserve SQL behavior; formatting should only change whitespace and keyword
  presentation.
- Do not silently apply structural SQL changes.
- Keep proposed SQL fixes reviewable before they affect downloads.
- Keep deployment artifacts ordered consistently.
- Preserve required `deployment.txt`, SQL, ZIP, and ticket-note formats unless
  the user explicitly changes the requirement.

### ARJUNA Installment Simulator

- Preserve formulas migrated from `docs/SimulasiAngsuranARJUNAv2.html` unless a
  behavior change is explicitly requested.
- Keep calculation logic separate from UI components.
- Add or update tests whenever formulas or rounding behavior change.
- Present financial results as estimates and avoid implying official financial
  advice or final approval.

## Testing And Verification

Before finishing a code change, run:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Verification should scale with the change:

- Add focused tests for changed business logic.
- Run existing DOCX parity tests when DOCX behavior may be affected.
- Run SQL analyzer, artifact, and guideline tests when SQL behavior may be
  affected.
- Run installment calculation tests when ARJUNA formulas may be affected.
- Smoke-test important routes after significant UI or routing changes.
- Verify the GitHub Pages deployment after pushing user-visible changes.

The Vite chunk-size warning is informational unless it causes a measurable
performance or deployment problem.

## Documentation Standards

- Update `README.md` when features, usage, or structure changes.
- Update `CHANGELOGS.md` for user-visible changes.
- Update relevant files under `docs/` when product rules or output contracts
  change.
- Keep legacy reference files clearly identified.
- Document intentional architecture changes.

## Git And Deployment Standards

- Use small commits with clear messages.
- Do not commit secrets, tokens, local browser profiles, generated temporary
  files, or OS/editor noise.
- Do not overwrite or revert unrelated user changes.
- Push user-visible completed work to `main` when deployment is requested.
- Confirm the GitHub Actions Pages workflow succeeds.
- Verify the live application at:
  `https://herusukmafama.github.io/personal-project-2/`

## Review Checklist

Before finishing:

- Existing routes and tools still work.
- New routes are linked from the appropriate navigation and dashboard surfaces.
- Business logic and output formats remain compatible unless intentionally
  changed.
- The application remains browser-only.
- No backend, API, database, authentication, or uploaded-file storage was
  introduced.
- SOLID principles are followed pragmatically without unnecessary abstraction.
- SonarQube-style quality risks are checked: complexity, duplication, dead code,
  unsafe APIs, unhandled errors, and missing focused tests.
- Theme, language, responsive layout, and accessibility still work.
- Tests, lint, build, and whitespace checks pass.
- README, changelog, and relevant docs are current.
- GitHub Pages can build and serve the application.
