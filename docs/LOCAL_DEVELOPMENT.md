# Running OpenTools Portal Locally

This guide explains how to install, run, test, and build the OpenTools Portal
on a local computer.

## Prerequisites

Install the following tools before starting:

- Git
- Node.js 20 or newer
- npm

Verify the installation:

```bash
git --version
node --version
npm --version
```

## Get The Project

Clone the repository:

```bash
git clone https://github.com/herusukmafama/personal-project-2.git
cd personal-project-2
```

If the project is already available locally, open a terminal inside the project
folder:

```powershell
cd "D:\PERSONAL PROJECT\project-2"
```

## Install Dependencies

Run this command when setting up the project for the first time or after
dependencies change:

```bash
npm install
```

This installs React, TypeScript, Vite, Tailwind CSS, and the libraries used by
the portal tools.

## Start The Development Server

Run:

```bash
npm run dev
```

Vite will display a local URL, usually:

```text
http://localhost:5173/personal-project-2/
```

Open that URL in a browser. Code changes will normally appear automatically
without restarting the server.

To stop the development server, press:

```text
Ctrl + C
```

## Useful Commands

Run all automated tests:

```bash
npm test
```

Check code quality:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

The production files will be generated in:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

Vite will display the preview URL in the terminal.

## Recommended Verification Before Pushing

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
```

All commands should complete successfully before pushing changes.

## Application Routes

The project uses React Router with `HashRouter`. Main local routes include:

```text
http://localhost:5173/personal-project-2/#/
http://localhost:5173/personal-project-2/#/tools/docx-to-json
http://localhost:5173/personal-project-2/#/tools/sql-deployment-formatter
http://localhost:5173/personal-project-2/#/tools/installment-simulator
http://localhost:5173/personal-project-2/#/built-with
http://localhost:5173/personal-project-2/#/changelog
```

## Browser-Only Behavior

The portal does not require a backend, API, database, authentication, or local
environment variables.

- Uploaded DOCX and SQL files stay in browser memory.
- Files are not uploaded to a server.
- Calculations run directly in the browser.
- `localStorage` is used only for theme and language preferences.

## Troubleshooting

### `npm` or `node` is not recognized

Install Node.js, then close and reopen the terminal.

### Port `5173` is already in use

Vite will usually select another port automatically. Use the URL shown in the
terminal.

You can also choose a specific port:

```bash
npm run dev -- --port 5174
```

### Dependencies or build behave unexpectedly

Delete `node_modules` and reinstall dependencies.

PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

Only remove `node_modules`. Do not delete project source files or the `.git`
folder.

### Git reports an unsafe repository on Windows

Run:

```powershell
git config --global --add safe.directory "D:/PERSONAL PROJECT/project-2"
```

### GitHub Pages paths differ from localhost

The Vite base path is configured as:

```text
/personal-project-2/
```

Use the URL shown by Vite and keep the `/personal-project-2/` path when opening
the project locally.
