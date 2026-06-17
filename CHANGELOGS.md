# Changelogs

All notable changes and planned improvements for the OpenTools Portal are
documented here.

## Released - Compare Text Tool - 2026-06-17

Added a browser-only text comparison tool inspired by lightweight Beyond
Compare workflows.

### Updates

- Added **Compare Text** as a new dashboard and sidebar tool.
- Added paste and local text-file input for left and right comparison.
- Added automatic text-type detection for SQL, JSON, XML/HTML, Markdown,
  CSV/TSV, and plain text.
- Added opt-in normalization for SQL and JSON before comparing.
- Added side-by-side and unified diff views with summary counters and compare
  options.

## Released - OpenTools Rename and Flexible DOCX V2 - 2026-06-17

Renamed the portal and improved DOCX to JSON V2 for partial Word templates.

### Updates

- Renamed user-facing branding from **Personal Tools** to **OpenTools**.
- Updated DOCX to JSON V2 so deleted Word template rows are omitted from the
  generated JSON.
- Changed empty DOCX V2 `Value` cells to output blank text instead of falling
  back to the default template value.
- Kept the full `040002` Word template available as a starting point.

## Released - DOCX to JSON V2 for 040002 Template - 2026-06-17

Added a new DOCX conversion flow that keeps the existing DOCX to JSON
converter unchanged.

### Updates

- Added **DOCX to JSON V2** as a separate dashboard and sidebar tool.
- Added a downloadable Word template for the Help & Support `040002.json`
  structure.
- Added template-driven mapping so filled Word values overlay the base JSON
  while empty fields keep the original defaults.
- Added automatic JSON preview and download for the V2 flow.
- Added focused tests for template recognition, value overlay, default
  fallback, and the downloadable Word template.

## Released - SQL Formatter Upload and Bulk Review UX - 2026-06-11

Improved the SQL Deployment Formatter workflow for repeated deployment
preparation.

### Updates

- Enabled browser-native autocomplete for Feature and Database/Project
  metadata.
- Updated the ticket greeting to `Dear Mas @idc_hardy,`.
- Added **Accept all safe changes** while keeping destructive changes under
  manual review.
- Added drag-and-drop support for one or multiple SQL files.
- Clarified that multi-file results are downloaded as a ZIP containing the
  accepted SQL files and `deployment.txt`.

## Released - Apple-Inspired Typography - 2026-06-09

Refined the portal typography to follow the clean, readable character of
Apple's website while keeping the existing dashboard layout.

### Updates

- Expanded the system font stack to prefer SF Pro where it is available.
- Added smoother font rendering, kerning, and consistent form-control fonts.
- Updated primary page headings with a lighter weight, tighter tracking, and a
  clearer responsive type scale.
- Kept the implementation local without loading proprietary Apple web fonts.

## Released - Built With Portfolio Page - 2026-06-08

Added a portfolio-friendly **Built With** page for issue #3.

### Updates

- Added a new **Built With** navigation item and route.
- Added responsive technology cards with local inline icons, categories, and
  descriptions.
- Included the current project stack across frontend foundation, document
  processing, developer productivity, quality/testing, and deployment.
- Kept the page responsive and compatible with light/dark mode.

## Released - ARJUNA Installment Simulator - 2026-06-08

Migrated `docs/SimulasiAngsuranARJUNAv2.html` into the OpenTools Portal
as feature 3.

### Updates

- Added a browser-only ARJUNA installment simulator route.
- Added Effective Rate and Flat Rate simulation modes.
- Added automatic result updates for loan amount, tenor, and rate inputs.
- Added an easy-to-read summary and monthly schedule for installment,
  interest, principal, and remaining principal.
- Added copyable simulation summary for quick sharing.
- Kept the legacy HTML document in `docs/` as the migration reference.

## Released - Automatic SQL Deployment Order - 2026-06-08

Updated **SQL Deployment Formatter** so deployment order is handled
automatically.

### Updates

- SQL files are now sorted ascending by the numeric prefix in the generated
  output filename.
- Manual move up/down controls were removed to keep the flow simpler.
- The remove file action remains available.

## Released - SLRC Ticket Note Format - 2026-06-08

Updated **SQL Deployment Formatter** output helpers for deployment requests.

### Updates

- Changed the ticket note format to match the requested SLRC deployment
  message template.
- Added database and feature/branch metadata to the ticket note.
- Changed the `deployment.txt` preview action from download to copy, while ZIP
  downloads still include `deployment.txt` at the root for multi-file outputs.

## Released - Portal Theme, Language, and Changelog - 2026-06-08

Added a cleaner global portal experience while preserving the existing DOCX
and SQL tool behavior.

### Updates

- Added a minimal global footer with **Created by Heru** on every page.
- Added a **Changelog** menu and page with static feature update history.
- Applied the Apple-style system font stack globally.
- Added light and dark theme support with the selected theme stored in
  `personal_tools_theme`.
- Added Indonesian and English language support with the selected language
  stored in `personal_tools_language`.
- Updated dashboard and tool descriptions with friendlier bilingual wording.

## Released - SQL Guideline Auto-Fix and Diff Review - 2026-06-06

Implemented browser-only SQL guideline proposals, mandatory per-file review,
accepted-revision downloads, and unified/side-by-side diff review.

### Goal

Extend **Format Your SQL for SLRC Deployment** so users can convert supported
SQL guideline warnings into compliant SQL, review every change, and explicitly
approve the revised result before download.

### User Flow

1. User uploads one or multiple SQL files.
2. The tool formats and validates each original SQL file.
3. Supported guideline fixes are proposed but are not immediately applied to
   the downloadable result.
4. User opens **Review changes** to compare original and proposed SQL.
5. User accepts or rejects the proposed revision for each file.
6. Validation runs again against the accepted SQL.
7. Downloads use only the accepted SQL revision; rejected files continue using
   the original formatted SQL and keep their warnings.

### Auto-Fix Rules

The original uploaded SQL must remain immutable. Proposed SQL is stored as a
separate revision.

Safe fixes may be proposed automatically:

- Replace `CREATE OR REPLACE FUNCTION` with `CREATE FUNCTION` and prepend the
  matching `DROP FUNCTION IF EXISTS schema.function(parameter_types);`.
- Replace `CREATE OR REPLACE VIEW` with `CREATE VIEW` and prepend the matching
  `DROP VIEW IF EXISTS schema.view;`.
- Add `DROP TRIGGER IF EXISTS trigger_name ON schema.table;` before
  `CREATE TRIGGER`.
- Add `IF NOT EXISTS` to `CREATE SCHEMA`.
- Add `IF NOT EXISTS` to straightforward `ALTER TABLE ... ADD COLUMN`
  statements.
- Use the inferred guideline-compliant output filename to resolve filename
  operation-code warnings.

Potentially destructive or ambiguous fixes require explicit confirmation in
the diff review:

- Add `DROP TABLE IF EXISTS` before `CREATE TABLE`.
- Add `DROP MATERIALIZED VIEW IF EXISTS` before materialized-view creation.
- Any fix where object identity, function input parameter types, target table,
  quoted identifier, or statement boundary cannot be determined confidently.

The tool must not automatically fix:

- Potential hardcoded IDs in `INSERT` statements.
- Multiple unrelated DDL operations that should be split into separate files.
- Dependency ordering or dependent-view recreation.
- Business logic, query predicates, values, function bodies, or data changes.

Unsupported fixes remain warnings with a clear manual-action explanation.

### Diff Review

- Add an **Original / Proposed** review panel for the selected SQL file.
- Default to a unified line diff, with an optional side-by-side view on wider
  screens.
- Highlight additions, deletions, and unchanged context.
- Show a summary of proposed guideline fixes above the diff.
- Provide **Accept proposed SQL**, **Keep original SQL**, and
  **Reset decision** actions per file.
- Show each file's review state: `No changes`, `Needs review`, `Accepted`, or
  `Rejected`.
- Disable deployment downloads while any proposed revision still needs review.
- Preserve editable generated filenames and deployment ordering.

### Technical Plan

- Add a guideline transformation module that receives original SQL plus parsed
  analysis and returns:
  - proposed SQL,
  - applied fix records,
  - confidence level,
  - remaining validation findings.
- Extend `SqlFileResult` with immutable original SQL, formatted original SQL,
  proposed SQL, accepted SQL, proposed fixes, and review state.
- Reuse the existing top-level SQL splitter and strengthen it for quoted
  identifiers, function signatures, parameter modes/defaults, dollar-quoted
  bodies, materialized views, and trigger target tables.
- Add a browser-compatible line-diff dependency and render the diff through a
  dedicated React review component.
- Re-run analysis, filename inference, and validation whenever a proposed
  revision is accepted or rejected.
- Generate SQL downloads, ZIP files, `deployment.txt`, and ticket notes from
  accepted revisions only.

### Validation and Safety

- A proposed fix must preserve comments, string literals, dollar-quoted
  function bodies, and statement order outside the required guideline change.
- Low-confidence transformations must never be auto-applied.
- Review decisions remain browser-memory only and reset when the page reloads.
- The tool remains browser-only with no API, backend, database, upload, or
  browser storage.

### Test Plan

- Verify each supported fix produces the expected guideline-compliant SQL.
- Verify function DROP signatures contain only valid input parameter types and
  preserve complex defaults and function bodies.
- Verify quoted identifiers, comments, strings, and dollar-quoted bodies remain
  unchanged.
- Verify ambiguous and unsupported findings remain warnings without SQL edits.
- Verify destructive fixes require explicit confirmation.
- Verify unified and side-by-side diff content.
- Verify accept, reject, and reset review states.
- Verify downloads are blocked while revisions need review.
- Verify downloads and ZIP contents use accepted revisions only.
- Verify validation findings disappear only when the accepted SQL resolves
  them.
- Run the existing DOCX parity tests, SQL deployment tests, lint, production
  build, and GitHub Pages smoke test.

### Acceptance Criteria

- Users can convert supported warnings into proposed guideline-compliant SQL.
- No proposed SQL replaces the original without explicit user approval.
- Every SQL change is visible in a diff before approval.
- Unsupported or uncertain changes are clearly reported and never silently
  applied.
- Downloaded SQL and deployment bundles contain exactly the revisions approved
  by the user.
