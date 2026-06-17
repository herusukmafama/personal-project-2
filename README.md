# OpenTools Portal

A browser-only OpenTools dashboard built with React, TypeScript, Vite, and Tailwind CSS.

## Included

- Responsive SaaS-style dashboard layout
- React Router navigation
- Browser-only DOCX to JSON converter migrated from the legacy application
- Preserved Help & Support JSON mapping behavior using Mammoth.js
- DOCX to JSON V2 for generating the `040002.json` Help & Support structure
  from a downloadable Word template
- Browser-only PostgreSQL deployment formatter for SLRC-ready SQL files,
  deployment.txt, ZIP bundles, ticket notes, guideline auto-fixes, and diff review
- Browser-only ARJUNA installment simulator for effective-rate and flat-rate
  installment schedules
- Portfolio-style Built With page describing the project technology stack
- GitHub Pages deployment workflow

## Run Locally

```bash
npm install
npm run dev
```

See the complete setup, command, route, and troubleshooting guide in
[`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md).

## Build

```bash
npm run build
```

## Migration Reference

The previous browser application is preserved under `legacy/`. Migration details
and behavior-parity notes are documented in `docs/MIGRATION.md`.

DOCX to JSON V2 usage notes are documented in
[`docs/DOCX_TO_JSON_V2.md`](docs/DOCX_TO_JSON_V2.md).
