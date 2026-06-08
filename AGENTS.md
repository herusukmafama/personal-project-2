# AGENTS.md

Guidance for future agents and contributors working on the Personal Tools
Portal.

## Project Context

This repository contains a browser-only personal tools dashboard designed for
simple, friendly workflows that can be used by technical and non-technical
users.

Current tools:

- DOCX to JSON Converter for Help & Support document templates.
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
- `localStorage` is allowed only for theme and language preferences.
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
- Use `personal_tools_theme` and `personal_tools_language` as the only
  preference-storage keys.
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
- Theme, language, responsive layout, and accessibility still work.
- Tests, lint, build, and whitespace checks pass.
- README, changelog, and relevant docs are current.
- GitHub Pages can build and serve the application.
