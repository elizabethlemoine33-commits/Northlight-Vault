# Cloud File Browser — Project Memory

Re-read this file at the start of every session before doing anything else.

---

## What This Project Is

A Windows desktop application that lets Elizabeth Lemoine browse multiple
Google Drive accounts simultaneously without logging in and out.

- **Read-only for v1** — no upload, edit, or delete
- **Google Drive only** — OneDrive was dropped (Azure account setup too complex)
- **Personal use** — single Windows 11 machine, not distributed publicly

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Desktop framework | Electron v42 | Cross-platform desktop apps using web tech; huge community |
| UI library | React 18 | Component-based UI; most widely used |
| Language | TypeScript | Catches mistakes before runtime; safer for larger projects |
| Build tool | electron-vite v3 + Vite v6 | Fast builds; correct Electron project structure |
| Token storage | keytar | Stores OAuth tokens in Windows Credential Store (encrypted) |
| Account list storage | electron-store | Persists account metadata (no tokens) to a local JSON file |
| Google API | googleapis | Official Google Drive API client |

---

## Security Model (Non-Negotiable)

Electron splits the app into two processes:

- **Main process** (`src/main/`) — runs Node.js; handles all API calls,
  token storage, and file listing. The only part that touches credentials.
- **Renderer process** (`src/renderer/`) — runs React in a sandboxed browser
  context. Cannot access Node.js, the filesystem, or credentials directly.
- **Preload script** (`src/preload/`) — the secure bridge. Only functions
  explicitly listed here can be called from the renderer.

**Rules:**
- OAuth tokens → `keytar` only. Never written to files. Never logged.
- No secrets in frontend (renderer) code. Ever.
- `nodeIntegration: false` and `contextIsolation: true` must stay enabled.

---

## Folder Structure

```
/
├── CLAUDE.md                  ← This file (project memory)
├── package.json               ← App identity, dependencies, run scripts
├── electron.vite.config.ts    ← Build configuration
├── tsconfig.json              ← TypeScript config root
├── tsconfig.node.json         ← TS config for main + preload (Node.js types)
├── tsconfig.web.json          ← TS config for renderer (browser types)
├── .gitignore                 ← Never commit node_modules, secrets, out/
├── rules/
│   └── claude-rules.md        ← Behavioral rules for Claude (copy from Downloads)
├── task/
│   └── todo.md                ← Master task checklist (always keep updated)
└── src/
    ├── main/
    │   └── index.ts           ← Electron main process (app backend)
    ├── preload/
    │   └── index.ts           ← Secure bridge (contextBridge)
    └── renderer/
        ├── index.html         ← HTML shell with Content Security Policy
        └── src/
            ├── main.tsx       ← React entry point
            ├── App.tsx        ← Root React component
            └── index.css      ← Global styles
```

---

## Key Commands

```bash
npm run dev       # Start the app in development mode (hot reload)
npm run build     # Build the app for production
npm run typecheck # Check TypeScript without building
```

**Important:** Node.js must be on the PATH. If commands fail, run:
`$env:PATH += ";C:\Program Files\nodejs"` in PowerShell first.

---

## Google OAuth Credentials

- Registered at: console.cloud.google.com
- Project name: CloudFileBrowser
- Credential type: OAuth 2.0 Desktop App
- Credentials JSON: downloaded and saved locally by Elizabeth (NOT in this repo)
- Client ID and Secret: stored securely by Elizabeth, NOT in any code file

---

## Build Status

| Phase | Status |
|---|---|
| Phase 0 — Prerequisites | ✅ Complete |
| Phase 1 — Project Scaffold | ✅ Complete |
| Phase 2 — Google Drive Auth | ⬜ Not started |
| Phase 3 — OneDrive Auth | ~~Dropped~~ |
| Phase 4 — File Browser | ⬜ Not started |
| Phase 5 — Universal Search | ⬜ Not started |
| Phase 6 — Polish & Packaging | ⬜ Not started |

---

## Conventions

- All API calls must go through the main process — never the renderer
- Each phase ends with a security review before committing
- Commits are small, atomic, and descriptive
- Never push to `main` without Elizabeth's explicit confirmation
- Explain every decision in plain English (Elizabeth is returning to coding)
