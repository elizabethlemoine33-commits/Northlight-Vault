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

### 8.1 Install packages
- [x] **8.1.1** Installed `@azure/msal-node` and `@microsoft/microsoft-graph-client` ✅
- [x] **8.1.3** 0 vulnerabilities confirmed ✅

### 8.2 Azure credentials — secure setup
- [x] **8.2.1** `azure-credentials.json` created in resources/ — gitignored ✅
- [x] **8.2.2** Added to `.gitignore` ✅
- [x] **8.2.3** Client ID configured ✅
- [x] **8.2.4** Used public client (PKCE) flow — no client secret required ✅
- [x] **Note:** App registered using personal Microsoft account at portal.azure.com; MSAL replaced with direct PKCE implementation using Node crypto + fetch ✅

### 8.3 Backend — Microsoft OAuth flow
- [x] **8.3.1** Created `src/main/auth/microsoft.ts` ✅
- [x] **8.3.2** Opens Electron BrowserWindow to Microsoft sign-in URL ✅
- [x] **8.3.3** Captures auth code via redirect to `http://localhost:58342` ✅
- [x] **8.3.4** Exchanges code for tokens using PKCE (no MSAL) ✅
- [x] **8.3.5** Tokens stored in Windows Credential Store via keytar ✅
- [x] **8.3.6** User profile fetched from Microsoft Graph (/me) ✅

### 8.4 Backend — Account management for OneDrive
- [x] **8.4.1** `src/main/accounts.ts` updated — supports `provider: 'google' | 'onedrive'` ✅
- [x] **8.4.2** IPC handler `accounts:connect-onedrive` added ✅
- [x] **8.4.3** IPC handler `accounts:disconnect-onedrive` added ✅

### 8.5 Backend — OneDrive file listing
- [x] **8.5.1** Created `src/main/drive/onedrive.ts` ✅
- [x] **8.5.2** Lists files/folders via Microsoft Graph API ✅
- [x] **8.5.3** Returns same shape as Google Drive results ✅
- [x] **8.5.4** `drive:listFiles` IPC handler auto-routes by provider ✅

### 8.6 Backend — OneDrive token refresh
- [x] **8.6.1** `getValidAccessToken()` refreshes silently using refresh token ✅
- [x] **8.6.2** Updated tokens saved back to keytar ✅

### 8.7 Backend — Include OneDrive in universal search
- [x] **8.7.1** `search/index.ts` fans out to OneDrive accounts ✅
- [x] **8.7.2** Uses `/me/drive/search(q='...')` Graph endpoint ✅
- [x] **8.7.3** Results merged and sorted by modified date ✅

### 8.8 Preload bridge — expose OneDrive functions
- [x] **8.8.1** `connectOneDrive()` and `disconnectOneDrive()` exposed in preload ✅

### 8.9 Frontend — OneDrive account tabs
- [x] **8.9.1** "Connect OneDrive" button added (blue, distinct from Google button) ✅
- [x] **8.9.2** OneDrive accounts show blue avatar + "OneDrive" badge ✅
- [x] **8.9.3** Selecting OneDrive tab shows file browser ✅

### 8.10 Frontend — OneDrive file browser
- [x] **8.10.1** FileList.tsx reused — works for OneDrive with no changes ✅
- [x] **8.10.2** Folder navigation and breadcrumbs confirmed working ✅
- [x] **8.10.3** Open button works for OneDrive files ✅

### 8.11 Frontend — OneDrive in search results
- [x] **8.11.1** OneDrive files appear in universal search results ✅
- [x] **8.11.2** Account badge shows account email ✅
- [x] **8.11.3** Open button works for OneDrive search results ✅

### 8.12 Security review
- [x] **8.12.1** No credentials in renderer or preload ✅
- [x] **8.12.2** Tokens in keytar only — never logged ✅
- [x] **8.12.3** `azure-credentials.json` gitignored and absent from history ✅
- [x] **8.12.4** All OneDrive API calls in main process only ✅
- [x] **8.12.5** Google Drive browse, search, and open confirmed intact ✅

### 8.13 Commit checkpoint
- [ ] **8.13.1** Commit: "feat: Microsoft OneDrive multi-account support with file browser and search"

---

## Phase 9 — Northlight Vault Brand Refresh (Priority 3)

**Goal:** Rename the app "Northlight Vault" and apply Elizabeth's Northlight brand identity — dark Aurora palette, Jost/Outfit fonts, gradient accent bar, and the document-with-aurora-rays icon.

**Plain-English explanation:** Right now the app looks like a generic dark UI. We're going to give it a personality that matches Elizabeth's consulting brand. The biggest changes are: new name everywhere, new color scheme (deep midnight black + aurora gradient accents), new fonts, and a proper icon. Nothing about how the app *works* changes — only how it looks.

**Brand reference files:**
- Colors, fonts, gradients: `C:\Users\erand\Downloads\northlight_brand_v8.html`
- Icon SVG: `C:\Users\erand\Downloads\northlight_vault_icon_v2.html`

**Aurora palette:**
- Midnight (background): `#0E0E14`
- Birch (primary text): `#F0ECE4`
- Glacial (accent): `#4FC3C8`
- Boreal (mid): `#5B8DD9`
- Dusk (mid): `#8B6FD4`
- Aurora (accent): `#C46FAA`
- Gradient bar: `linear-gradient(90deg, #4fc3c8 0%, #5b8dd9 30%, #8b6fd4 65%, #c46faa 100%)`

**Fonts:** Jost (headings, labels, UI chrome) + Outfit (body text, metadata) — loaded from Google Fonts via HTML `<link>`

---

### 9.1 App rename
- [ ] **9.1.1** In `package.json` — change `name` to `northlight-vault` and `productName` to `Northlight Vault`
- [ ] **9.1.2** In `src/main/index.ts` — change `BrowserWindow` title to `"Northlight Vault"`
- [ ] **9.1.3** In `src/renderer/index.html` — change `<title>` to `"Northlight Vault"`
- [ ] **9.1.4** In `CLAUDE.md` — update "What This Project Is" section to reflect new name

### 9.2 Fonts
- [ ] **9.2.1** In `src/renderer/index.html` — add Google Fonts `<link>` for Jost (300,400,500,600,700) and Outfit (300,400,500,600)
- [ ] **9.2.2** In `src/renderer/src/index.css` — set `body { font-family: 'Outfit', sans-serif; }` as default

### 9.3 CSS variables / design tokens
- [ ] **9.3.1** In `src/renderer/src/index.css` — define CSS custom properties for the full palette:
  ```css
  :root {
    --midnight: #0E0E14;
    --birch: #F0ECE4;
    --glacial: #4FC3C8;
    --boreal: #5B8DD9;
    --dusk: #8B6FD4;
    --aurora: #C46FAA;
    --surface: #12121e;
    --border: #2a2a48;
    --muted: #5a6080;
    --gradient-bar: linear-gradient(90deg, #4fc3c8 0%, #5b8dd9 30%, #8b6fd4 65%, #c46faa 100%);
    --gradient-text: linear-gradient(105deg, #4fc3c8 0%, #5b8dd9 33%, #8b6fd4 66%, #c46faa 100%);
  }
  ```
- [ ] **9.3.2** Update `body` background to `var(--midnight)` and text color to `var(--birch)`

### 9.4 Sidebar redesign (App.css + App.tsx)
- [ ] **9.4.1** In `App.css` — update `.sidebar` background to `#08080f` (deeper than main bg), right border `1px solid #1e2035`
- [ ] **9.4.2** In `App.css` — add 3px gradient accent bar at top of sidebar:
  ```css
  .sidebar::before {
    content: '';
    display: block;
    height: 3px;
    background: var(--gradient-bar);
  }
  ```
- [ ] **9.4.3** In `App.tsx` — change sidebar heading from "Cloud File Browser" to "Northlight Vault"
- [ ] **9.4.4** In `App.css` — style `.sidebar-title` with Jost font, gradient text fill (like the brand wordmark), smaller/tighter version
- [ ] **9.4.5** In `App.tsx` — add subtitle text "Cloud File Browser" below the main title in a smaller, muted style
- [ ] **9.4.6** In `App.css` — update account tab cards to use `--surface` background with `--border` outline; selected state uses a subtle gradient left-border accent

### 9.5 Button styling
- [ ] **9.5.1** In `App.css` — update `.connect-btn` (Connect Google Drive) to use gradient background (`var(--gradient-bar)`) with white text
- [ ] **9.5.2** In `App.css` — update `.connect-btn-onedrive` to use same gradient (not a distinct blue — brand consistency)
- [ ] **9.5.3** In `FileList.css` / `SearchResults.css` — update `.open-btn` to use `--dusk` or gradient border with gradient text, dark background (ghost style)

### 9.6 Provider badges
- [ ] **9.6.1** In `App.css` — update `.badge-google` to use `--glacial` color family
- [ ] **9.6.2** In `App.css` — update `.badge-onedrive` to use `--boreal` color family
- [ ] **9.6.3** In `App.css` — update avatar initials background to use `--dusk` for Google, `--boreal` for OneDrive

### 9.7 Main content area
- [ ] **9.7.1** In `App.css` — update `.main-content` background to `var(--midnight)`
- [ ] **9.7.2** In `App.css` — update search bar to use `--surface` background, `--border` border, `--birch` text, `--glacial` focus ring
- [ ] **9.7.3** In `FileList.css` — update table header, row hover, and border colors to match brand
- [ ] **9.7.4** In `SearchResults.css` — update result rows, hover state, and badge styling

### 9.8 App icon
- [ ] **9.8.1** Extract the SVG path data from `northlight_vault_icon_v2.html` (the 96×110 viewBox document with aurora rays)
- [ ] **9.8.2** Create a 256×256 PNG icon file at `resources/icon.png` — can be done by saving a small HTML file that renders the icon and screenshotting, or by using a Node script
- [ ] **9.8.3** In `electron.vite.config.ts` and `package.json` (electron-builder config) — point to the new `resources/icon.png`
- [ ] **9.8.4** In `src/main/index.ts` — set `BrowserWindow` `icon` property to the new icon path

### 9.9 Security review
- [ ] **9.9.1** Confirm no logic changes — only CSS, HTML, and config (no IPC, no auth, no API calls modified)
- [ ] **9.9.2** Confirm Google Fonts load via `<link>` in renderer HTML (CSP-safe — fonts.googleapis.com and fonts.gstatic.com are already trusted origins or need to be added)
- [ ] **9.9.3** TypeScript typecheck — 0 errors

### 9.10 Visual verification
- [ ] **9.10.1** Run `npm run dev` and confirm the app title bar reads "Northlight Vault"
- [ ] **9.10.2** Confirm sidebar gradient bar renders at top
- [ ] **9.10.3** Confirm "Northlight Vault" heading uses gradient text
- [ ] **9.10.4** Confirm fonts loaded (Jost for headings, Outfit for body)
- [ ] **9.10.5** Confirm Connect buttons use gradient
- [ ] **9.10.6** Confirm file list, search, and open button are all readable on the dark background
- [ ] **9.10.7** Connect a Google account, browse files, search — confirm nothing broken

### 9.11 Commit checkpoint
- [ ] **9.11.1** Commit: "feat: Northlight Vault brand refresh — rename, Aurora palette, Jost/Outfit fonts, gradient accents"

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
