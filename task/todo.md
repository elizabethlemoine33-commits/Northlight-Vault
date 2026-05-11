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
- [x] **6.1.1** Consistent spacing, fonts, color scheme applied ✅
- [x] **6.1.2** Windows 11 compatible — standard title bar and window controls ✅
- [x] **6.1.3** App icon created and applied (dark blue circle with "C") ✅

### 6.2 Error Handling
- [x] **6.2.1** Error states in FileList and SearchResults components ✅
- [x] **6.2.2** Failed account search doesn't crash others (Promise.allSettled) ✅
- [ ] **6.2.3** Rate limit handling — deferred to v1.1

### 6.3 Packaging
- [x] **6.3.1** electron-builder configured for Windows NSIS installer ✅
- [x] **6.3.2** Installer tested and installs cleanly ✅
- [x] **6.3.3** OAuth and file listing confirmed working in packaged app ✅

### 6.4 Final Security Review
- [x] **6.4.1** No secrets in code; tokens only in Windows Credential Store ✅
- [x] **6.4.2** All API calls (Drive, search, auth) in main process only ✅
- [x] **6.4.3** contextIsolation: true, nodeIntegration: false enforced ✅
- [x] **6.4.4** google-credentials.json excluded from git ✅
- [x] **6.4.5** 0 npm vulnerabilities ✅

### 6.5 Final Commit
- [ ] **6.5.1** Commit: "feat: Windows packaging and production build config"

---

## v1.1 Backlog (promoted to v2 — see Phases 7–9 below)
- [x] Open files on click → Phase 7
- [ ] Add additional Google accounts (test with 2nd account)
- [ ] Rate limit / retry handling for Drive API
- [ ] Token expiry prompt — re-auth flow if refresh token expires

---

## v2 — Phases 7, 8, 9

---

## Phase 7 — Open Files (Priority 1)

**Goal:** Single click opens any file from the file browser or search results in the default web browser.

**Plain-English explanation:** Every file stored in Google Drive has a URL (called a `webViewLink`) that opens it in a browser tab. We need to pass that URL from the backend (main process) to the frontend (renderer), then call Electron's `shell.openExternal()` to open it — the same way a link on a webpage opens in your browser.

### 7.1 Backend — Return webViewLink with file data
- [x] **7.1.1** In `src/main/drive/google.ts`, added `webViewLink` to the fields requested from the Drive API ✅
- [x] **7.1.2** Verify the returned file objects now include the link field — TypeScript typecheck passed ✅

### 7.2 Backend — IPC handler to open URLs
- [x] **7.2.1** In `src/main/index.ts`, added IPC handler `file:open` that calls `shell.openExternal(url)` ✅
- [x] **7.2.2** URL validated with `startsWith('https://')` before opening ✅

### 7.3 Preload bridge — expose the open function
- [x] **7.3.1** In `src/preload/index.ts`, added `openFile(url: string)` to the exposed API ✅

### 7.4 Frontend — File browser "Open" button
- [x] **7.4.1** In `src/renderer/src/components/FileList.tsx`, added "Open" button for non-folder items ✅
- [x] **7.4.2** Clicking "Open" calls `window.api.openFile(webViewLink)` ✅
- [x] **7.4.3** Folders still navigate into the folder — row click unchanged ✅

### 7.5 Frontend — Search results "Open" button
- [x] **7.5.1** In `src/renderer/src/components/SearchResults.tsx`, added "Open" button to each result ✅
- [x] **7.5.2** Clicking "Open" calls `window.api.openFile(webViewLink)` with `stopPropagation` ✅
- [x] **7.5.3** Row click (switch account tab) still works as before ✅

### 7.6 Search backend — include webViewLink in results
- [x] **7.6.1** In `src/main/search/index.ts`, added `webViewLink` to fields and interface ✅

### 7.7 Security review
- [x] **7.7.1** URL validation (https:// check) confirmed in `file:open` handler ✅
- [x] **7.7.2** `webViewLink` contains no tokens or secrets — standard Drive URL ✅
- [x] **7.7.3** TypeScript typecheck passed with 0 errors; no existing behavior changed ✅

### 7.8 Commit checkpoint
- [ ] **7.8.1** Commit: "feat: open files in browser from file browser and search results"

---

## Phase 8 — Microsoft OneDrive Support (Priority 2)

**Goal:** Connect one or more OneDrive accounts alongside Google Drive. Browse files, search, and open files from OneDrive — using the same tab-based UI.

**Plain-English explanation:** OneDrive uses Microsoft's identity platform (called MSAL) instead of Google's OAuth system. The steps are similar — open a sign-in window, capture an auth code, exchange it for tokens, store tokens in the Windows Credential Store — but the library and API endpoints are different. Files are listed using the Microsoft Graph API (Microsoft's equivalent of the Google Drive API).

### 8.1 Install MSAL and Microsoft Graph SDK
- [ ] **8.1.1** Install `@azure/msal-node` (handles Microsoft OAuth for desktop apps)
- [ ] **8.1.2** Install `@microsoft/microsoft-graph-client` (lists OneDrive files)
- [ ] **8.1.3** Run `npm audit` — confirm 0 new vulnerabilities

### 8.2 Azure credentials — secure setup
- [ ] **8.2.1** Create `azure-credentials.json` in project root (structure: `{ "clientId": "", "tenantId": "common" }`) — gitignored, never committed
- [ ] **8.2.2** Confirm `azure-credentials.json` is in `.gitignore`
- [ ] **8.2.3** Elizabeth pastes her Azure Client ID into the file when prompted — Claude will give exact instructions at this step
- [ ] **8.2.4** NOTE: Desktop apps registered in Azure as "public clients" do NOT need a Client Secret — MSAL uses PKCE (a code challenge) instead. If Elizabeth's app was registered with a client secret, we will discuss the right approach at this step.

### 8.3 Backend — Microsoft OAuth flow
- [ ] **8.3.1** Create `src/main/auth/microsoft.ts`
- [ ] **8.3.2** Open Electron BrowserWindow to Microsoft sign-in URL
- [ ] **8.3.3** Capture auth code via redirect to `http://localhost` (same pattern as Google)
- [ ] **8.3.4** Exchange code for access + refresh tokens using MSAL
- [ ] **8.3.5** Store tokens in Windows Credential Store via `keytar` (key: `onedrive-<accountId>`)
- [ ] **8.3.6** Fetch user profile from Microsoft Graph to get display name and email

### 8.4 Backend — Account management for OneDrive
- [ ] **8.4.1** Update `src/main/accounts.ts` to support `provider: 'onedrive'` alongside `provider: 'google'`
- [ ] **8.4.2** Add IPC handler `connect-onedrive` (mirrors `connect-google`)
- [ ] **8.4.3** Add IPC handler `disconnect-onedrive` (removes token from keytar, account from store)

### 8.5 Backend — OneDrive file listing
- [ ] **8.5.1** Create `src/main/drive/onedrive.ts`
- [ ] **8.5.2** List files/folders in a OneDrive folder using Microsoft Graph API
- [ ] **8.5.3** Return consistent shape: `{ id, name, mimeType, size, modifiedTime, isFolder, webUrl }` — same structure as Google Drive results
- [ ] **8.5.4** Add IPC handler `list-onedrive-files` (mirrors `list-google-files`)

### 8.6 Backend — OneDrive token refresh
- [ ] **8.6.1** Auto-refresh expired tokens using MSAL's token cache before each API call
- [ ] **8.6.2** Update stored token in keytar after refresh

### 8.7 Backend — Include OneDrive in universal search
- [ ] **8.7.1** In `src/main/search/index.ts`, fan out to OneDrive accounts alongside Google accounts
- [ ] **8.7.2** Microsoft Graph search uses `/me/drive/search(q='...')` endpoint
- [ ] **8.7.3** Results merged and sorted by modified date (same as existing behavior)

### 8.8 Preload bridge — expose OneDrive functions
- [ ] **8.8.1** In `src/preload/index.ts`, add `connectOneDrive()`, `disconnectOneDrive(accountId)`, `listOneDriveFiles(accountId, folderId)` to the API

### 8.9 Frontend — OneDrive account tabs
- [ ] **8.9.1** In `src/renderer/src/App.tsx`, add "Connect OneDrive" button alongside "Connect Google Drive"
- [ ] **8.9.2** OneDrive accounts appear as tabs with a OneDrive icon/badge (visually distinct from Google tabs)
- [ ] **8.9.3** Selecting a OneDrive tab shows that account's file browser

### 8.10 Frontend — OneDrive file browser
- [ ] **8.10.1** Reuse or extend `FileList.tsx` to support OneDrive files (same table structure)
- [ ] **8.10.2** Folder navigation and breadcrumbs work for OneDrive
- [ ] **8.10.3** "Open" button works for OneDrive files (uses `webUrl` from Graph API)

### 8.11 Frontend — OneDrive in search results
- [ ] **8.11.1** Search results show OneDrive files alongside Google Drive files
- [ ] **8.11.2** Account badge distinguishes OneDrive vs Google Drive results
- [ ] **8.11.3** "Open" button works for OneDrive search results

### 8.12 Security review
- [ ] **8.12.1** No Client ID or Secret in any renderer or preload file
- [ ] **8.12.2** OneDrive tokens stored in keytar only — never logged, never written to files
- [ ] **8.12.3** `azure-credentials.json` confirmed absent from git history
- [ ] **8.12.4** All OneDrive API calls go through main process via IPC
- [ ] **8.12.5** Existing Google Drive functionality confirmed intact

### 8.13 Commit checkpoint
- [ ] **8.13.1** Commit: "feat: Microsoft OneDrive multi-account support with file browser and search"

---

## Phase 9 — UI Updates (Stretch Goal — DO NOT START)

**Status:** Acknowledged. Will not be started until Elizabeth explicitly says "begin Priority 3."

- [ ] **9.1** Update interface color scheme
- [ ] **9.2** Update app logo/icon
- [ ] **9.3** Any other visual polish

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
