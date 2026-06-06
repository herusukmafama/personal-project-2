# Personal Tools Portal

A browser-only personal tools dashboard built with React, TypeScript, Vite, and Tailwind CSS.

## Included

- Responsive SaaS-style dashboard layout
- React Router navigation
- Browser-only DOCX to JSON converter migrated from the legacy application
- Preserved Help & Support JSON mapping behavior using Mammoth.js
- Browser-only PostgreSQL deployment formatter for SLRC-ready SQL files,
  deployment.txt, ZIP bundles, and ticket notes
- GitHub Pages deployment workflow

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Migration Reference

The previous browser application is preserved under `legacy/`. Migration details
and behavior-parity notes are documented in `docs/MIGRATION.md`.
