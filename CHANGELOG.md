# Changelog — Northlight Vault

All notable changes are documented here.
Format: [Keep a Changelog](https://keepachangelog.com) · Versioning: [SemVer](https://semver.org)

---

## [Unreleased]
<!-- Work in progress — moved to a versioned section when shipped -->


---

## [1.0.1] — 2026-10-07

### Added
- **Feedback announcement** — dismissible banner on the landing screen inviting early feedback, with a "Share feedback" button that opens the feedback form; dismissal is remembered across restarts
- **Send Feedback… menu item** — permanent Help menu entry that opens the feedback form in the system browser

---

## [1.0.0] — 2026-05-13

### Added
- **Versioning system** — semantic versioning (MAJOR.MINOR.PATCH) established
- **Changelog** — this file; accessible via Help → View Changelog
- **Refresh button** — force-reloads file list from all connected providers
- **Check for Updates** — Help menu queries GitHub releases; shows modal if newer version exists
- **Dropbox integration** — OAuth 2.0 sign-in, file listing, folder navigation, search
- **Microsoft OneDrive support** — full multi-account OAuth, file browser, universal search
- **Open files** — single click opens any file in the default web browser
- **Universal search** — searches all connected accounts simultaneously (Google Drive, OneDrive, Dropbox)
- **Multi-account support** — connect any number of Google Drive, OneDrive, or Dropbox accounts
- **Folder navigation** — click into folders with breadcrumb trail
- **Northlight brand** — Aurora gradient palette, Jost/Outfit fonts, gradient accent bar, app icon

### Security
- OAuth tokens stored exclusively in Windows Credential Manager (keytar) — never in files or logs
- All cloud API calls routed through Electron main process only (renderer has no direct access)
- contextIsolation: true and nodeIntegration: false enforced throughout
- Content Security Policy set on renderer HTML

---

## [0.9.0] — 2026-05-09

### Added
- Northlight Vault brand refresh — renamed from "Cloud File Browser"
- Aurora gradient colour palette (Midnight, Birch, Glacial, Boreal, Dusk, Aurora)
- Jost + Outfit Google Fonts loaded in renderer
- App icon: aurora gradient document with signal bars (256×256 PNG + Windows ICO)
- Sidebar redesign: gradient accent bar, gradient title, left-border active tab indicator
- Connect buttons using aurora gradient fill

---

## [0.8.0] — 2026-05-09

### Added
- Microsoft OneDrive multi-account OAuth (PKCE flow, no client secret required)
- OneDrive file listing via Microsoft Graph API
- Token auto-refresh for OneDrive using stored refresh token
- OneDrive included in universal search fan-out
- OneDrive account tabs with blue avatar and "OneDrive" badge
- Disconnect OneDrive: revokes token, removes from account list

---

## [0.7.0] — 2026-05-09

### Added
- Open files: clicking "Open" on any file opens it in the default web browser
- URL validation in main process (https:// only — no file paths or other protocols)
- webViewLink included in file listing and search results for both Google Drive and OneDrive

---

## [0.6.0] — 2026-05-09

### Added
- Universal search across all connected Google Drive accounts simultaneously
- 350ms debounce on search input
- Search results show file name, account email badge, last modified date
- Clicking a result switches to that account's tab
- Promise.allSettled ensures one failed account doesn't break results from others

---

## [0.5.0] — 2026-05-09

### Added
- Google Drive file browser with folder navigation
- Breadcrumb trail (click any crumb to navigate back)
- File type icons: folder, document, spreadsheet, PDF, image, video, and more
- Loading state, error state, and empty folder state
- Auto token refresh via googleapis client

---

## [0.4.0] — 2026-05-09

### Added
- Google Drive OAuth 2.0 multi-account support
- Accounts persisted in electron-store (no tokens stored there)
- Each account shown in sidebar with name, email, avatar initial
- Disconnect: removes token from Windows Credential Manager and account from list

---

## [0.1.0] — 2026-05-09

### Added
- Project scaffold: Electron v42 + React 18 + TypeScript + electron-vite
- Security baseline: contextIsolation, nodeIntegration: false, Content Security Policy
- Preload bridge (contextBridge) as the only renderer↔main communication channel
- keytar for secure token storage (Windows Credential Manager)
- electron-store for account list persistence
- Windows NSIS installer configuration via electron-builder

---
