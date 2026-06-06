# SQL Deployment Formatter

The SQL Deployment Formatter prepares PostgreSQL scripts for SLRC deployment
using the local `Database Deployment Guidelines.docx` as its reference.

## Behavior

- Processes one or multiple `.sql` files entirely in the browser.
- Formats PostgreSQL whitespace and keyword casing without intentionally
  rewriting SQL structure or semantics.
- Infers guideline filename components and lets users edit the result.
- Preserves upload order by default and supports manual reordering.
- Reports structural guideline issues as warnings.
- Blocks downloads for missing metadata, invalid output filenames, unsupported
  files, processing failures, or duplicate output filenames.

## Outputs

- One SQL input downloads as one formatted SQL file. `deployment.txt` is
  available as a separate download.
- Multiple SQL inputs download as a ZIP containing the formatted SQL files and
  `deployment.txt`.
- A structured English ticket note is previewed and can be copied.
