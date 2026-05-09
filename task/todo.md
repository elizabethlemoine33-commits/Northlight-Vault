# Multi-Account Cloud File Browser — Master Task List

**Project:** Windows desktop app to browse multiple Google Drive accounts simultaneously
**Stack:** Electron + React + TypeScript
**Location:** `C:\Users\erand\OneDrive\Desktop\Claude Code`
**Rules file:** `rules/claude-rules.md`
**Note:** OneDrive support dropped — Google Drive only (decision made 2026-05-09)

---

## Legend
- [ ] = Not started
- [x] = Complete
- [~] = In progress

---

## Phase 0 — Prerequisites & Environment Setup

### 0.1 Git & Version Control
- [x] **0.1.1** Confirm Git for Windows is installed — v2.54.0 ✅
- [ ] **0.1.2** If not installed, download and install Git for Windows from git-scm.com (skipped — already installed)
- [ ] **0.1.3** Configure Git with user name and email
- [ ] **0.1.4** Initialize a Git repository in the project folder
- [ ] **0.1.5** Create a `.gitignore` file (exclude `node_modules`, `.env`, secrets)
- [ ] **0.1.6** Make first commit: "Initial project scaffold"

### 0.2 Node.js
- [x] **0.2.1** Check if Node.js is installed — not found initially
- [x] **0.2.2** Download Node.js LTS and install — v24.15.0 ✅
- [x] **0.2.3** Verify npm is working — v11.12.1 ✅

### 0.3 Google Developer Account (OAuth for Google Drive)
- [x] **0.3.1** Sign in to console.cloud.google.com ✅
- [x] **0.3.2** Create a new project called "CloudFileBrowser" ✅
- [x] **0.3.3** Enable the Google Drive API for the project ✅
- [x] **0.3.4** Create OAuth 2.0 credentials (Desktop App type) ✅
- [x] **0.3.5** Client ID and Client Secret downloaded as JSON ✅
- [ ] **0.3.6** Add authorized redirect URI: `http://localhost` — to do in Phase 2

### 0.4 Microsoft Azure Account (OAuth for OneDrive)
- [~] ~~DROPPED — OneDrive support removed from scope (2026-05-09)~~

---

## Phase 1 — Project Scaffold

### 1.1 Initialize Electron + React + TypeScript Project
- [x] **1.1.1** Manually scaffolded project (electron-vite auto-scaffold skipped — would have deleted existing files) ✅
- [x] **1.1.2** App launches with placeholder window — confirmed visually ✅
- [x] **1.1.3** Folder structure created and documented in CLAUDE.md ✅

### 1.2 Install Core Dependencies
- [x] **1.2.1** `electron-store` installed ✅
- [x] **1.2.2** `keytar` installed ✅
- [x] **1.2.3** `googleapis` installed ✅
- [x] **1.2.4** Microsoft Graph client — dropped (OneDrive removed from scope) ✅
- [x] **1.2.5** Security audit run — 0 vulnerabilities after upgrading to Electron v42 ✅

### 1.3 Security Baseline
- [x] **1.3.1** `contextIsolation: true` set in main/index.ts ✅
- [x] **1.3.2** `nodeIntegration: false` set in main/index.ts ✅
- [x] **1.3.3** `src/preload/index.ts` created with contextBridge ✅
- [x] **1.3.4** `.gitignore` excludes node_modules, out/, secrets, .env ✅
- [x] **1.3.5** Content Security Policy set in renderer/index.html ✅

### 1.4 CLAUDE.md
- [x] **1.4.1** `CLAUDE.md` created with full project context ✅

### 1.5 Commit Checkpoint
- [x] **1.5.1** Security review: no secrets in any file ✅
- [ ] **1.5.2** Commit: "feat: project scaffold with security baseline"

---

## Phase 2 — Google Drive Authentication

### 2.1 OAuth Flow
- [x] **2.1.1** Created `src/main/auth/google.ts` ✅
- [x] **2.1.2** Opens Electron BrowserWindow for Google sign-in ✅
- [x] **2.1.3** Captures auth code via temporary local HTTP server ✅
- [x] **2.1.4** Exchanges code for access + refresh tokens ✅
- [x] **2.1.5** Tokens stored in Windows Credential Store via keytar ✅

### 2.2 Multi-Account Support
- [x] **2.2.1** Account model: `{ id, provider, email, displayName }` ✅
- [x] **2.2.2** Account list persisted in electron-store (no tokens) ✅
- [x] **2.2.3** Multiple accounts supported — keyed by Google account ID ✅
- [x] **2.2.4** Disconnect removes token from keytar and account from store ✅

### 2.3 UI — Google Account Tabs
- [x] **2.3.1** Sidebar shows connected accounts ✅
- [x] **2.3.2** "Connect Google Drive" button ✅
- [x] **2.3.3** Each account shows name, email, avatar initial ✅
- [x] **2.3.4** Selecting tab activates account view (placeholder) ✅

### 2.4 Commit Checkpoint
- [x] **2.4.1** Security review: tokens in keytar only, not logged or written to files ✅
- [ ] **2.4.2** Commit: "feat: Google Drive multi-account OAuth"

---

## Phase 3 — OneDrive Authentication
~~DROPPED — OneDrive support removed from scope (2026-05-09)~~

---

## Phase 4 — File Browser

### 4.1 Google Drive File Listing
- [x] **4.1.1** Created `src/main/drive/google.ts` ✅
- [x] **4.1.2** Fetches root folder contents via Drive API v3 ✅
- [x] **4.1.3** Displays name, icon, size, last modified date ✅
- [x] **4.1.4** Click folder to navigate into it ✅
- [x] **4.1.5** Breadcrumb trail with click-to-navigate ✅

### 4.2 OneDrive File Listing
- [~] ~~DROPPED — OneDrive removed from scope~~

### 4.3 File Browser UI Component
- [x] **4.3.1** `FileList` React component in `src/renderer/src/components/FileList.tsx` ✅
- [x] **4.3.2** File type icons (folder, doc, sheet, PDF, image, video, etc.) ✅
- [x] **4.3.3** Loading state while fetching ✅
- [x] **4.3.4** Error state with plain-English message ✅
- [x] **4.3.5** Empty folder state ✅

### 4.4 Token Refresh
- [x] **4.4.1** Auto-refresh handled by googleapis client + keytar token update listener ✅
- [x] **4.4.2** Error state shown if auth fails (re-auth prompt is future polish) ✅

### 4.5 Commit Checkpoint
- [x] **4.5.1** Security review: all Drive API calls go through main process via IPC ✅
- [ ] **4.5.2** Commit: "feat: Google Drive file browser with folder navigation"

---

## Phase 5 — Universal Search

### 5.1 Search Bar UI
- [x] **5.1.1** Search bar at the top, always visible when accounts are connected ✅
- [x] **5.1.2** Typing triggers search across all accounts simultaneously ✅
- [x] **5.1.3** "Searching all accounts…" loading state ✅
- [x] **5.1.4** Merged results displayed in a single unified list ✅

### 5.2 Search Logic
- [x] **5.2.1** `src/main/search/index.ts` fans out to all accounts in parallel ✅
- [x] **5.2.2** Drive API `name contains` query with quote escaping ✅
- [x] **5.2.3** All Google accounts searched simultaneously via Promise.allSettled ✅
- [x] **5.2.4** Results sorted by most recently modified ✅

### 5.3 Search Results UI
- [x] **5.3.1** Each result shows file name, account email with avatar badge, last modified ✅
- [x] **5.3.2** Clicking a result switches to that account's tab and clears search ✅
- [x] **5.3.3** "No results" state with search term displayed ✅
- [x] **5.3.4** 350ms debounce on input ✅

### 5.4 Commit Checkpoint
- [x] **5.4.1** Security review: all search logic in main process, no token exposure in renderer ✅
- [ ] **5.4.2** Commit: "feat: universal search across all accounts"

---

## Phase 6 — Polish & Packaging

### 6.1 UI Refinement
- [ ] **6.1.1** Apply consistent spacing, fonts, and color scheme
- [ ] **6.1.2** Ensure the app looks appropriate on Windows 11 (title bar, window controls)
- [ ] **6.1.3** Add app icon

### 6.2 Error Handling
- [ ] **6.2.1** Global error boundary in React — catches unexpected crashes gracefully
- [ ] **6.2.2** Network error handling — show friendly message if offline
- [ ] **6.2.3** Rate limit handling — if Google/Microsoft throttles requests, back off and retry

### 6.3 Packaging
- [ ] **6.3.1** Configure `electron-builder` to package the app as a Windows `.exe` installer
- [ ] **6.3.2** Test the packaged installer on your machine
- [ ] **6.3.3** Confirm OAuth flows work in the packaged (non-dev) version

### 6.4 Final Security Review
- [ ] **6.4.1** Full audit: no secrets in code, no tokens in logs, no plain-text credential files
- [ ] **6.4.2** Confirm all API calls are in the main process
- [ ] **6.4.3** Confirm renderer cannot directly access the filesystem or Node.js APIs

### 6.5 Final Commit
- [ ] **6.5.1** Commit: "feat: polish, error handling, and Windows packaging"

---

## Review Section
*(Filled in as we complete each phase)*

### Files Created/Modified
*(To be updated)*

### Key Decisions Made
- **Framework:** Electron + React + TypeScript — chosen for broad community support and first-class cloud API SDKs
- **Token storage:** `keytar` (Windows Credential Store) — never plain text files
- **Account storage:** `electron-store` — stores account list only (no tokens)
- **Auth method:** Standard OAuth 2.0 for Google
- **Account limit:** Dynamic — designed to support any number of accounts from day one
- **Scope change:** OneDrive dropped 2026-05-09 — Azure account setup too complex; Google Drive only

### Assumptions
- User will set up Google and Microsoft developer accounts manually (guided step by step)
- App is for personal use on one Windows 11 machine (not distributed publicly)
- Read-only access for v1 (no upload, edit, or delete)
