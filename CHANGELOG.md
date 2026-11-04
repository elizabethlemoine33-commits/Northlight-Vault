# Changelog — Northlight Vault

All notable changes are documented here.
Format: [Keep a Changelog](https://keepachangelog.com) · Versioning: [SemVer](https://semver.org)

---

## [Unreleased]
<!-- Work in progress — moved to a versioned section when shipped -->


---

## [1.0.4] — 2026-11-04

### Added
- **Filter your search results.** Above the results there are now three filters: **Type** (documents, spreadsheets, presentations, PDFs, images, videos, audio, folders), **Modified** (past 24 hours, 7 days, 30 days or year) and **Account**. They work together with your search words and across Google Drive, OneDrive and Dropbox. Filters stay on between searches until you choose **Clear filters**. This uses only the file names, types and dates Vault already reads, so there are no new permissions.
- **A readable "What's new" window.** **Help → What's New (Changelog)** now opens a window inside Vault with each version, its date and labelled lists of what was added, changed and fixed. Before, it opened a plain text file.

### Changed
- **More results per search.** Vault now fetches up to 100 matches from each account (it was 20 to 25), so the filters have more to work with. If an account hits that limit, Vault says so.
- **Dropbox search now matches file names only**, the same as Google Drive. Before, Dropbox could also match words inside files on its side.
- **OneDrive search still uses Microsoft's own search**, which can match words inside your files as well as their names. Microsoft offers no name-only option. Vault does not read your files: Microsoft does the matching on its side and sends Vault the list of results.

### Fixed
- Spreadsheet and presentation files from Microsoft Office showed a document icon in search results. They now show the right icon.
- The empty search screen said "Google Drive accounts". It now says "connected accounts".

---

## [1.0.3] — 2026-11-03

### Privacy
- **Crash reports can no longer carry search terms, file names or request addresses.** Sentry's default activity trail (console messages and the address of every web request) is switched off. Only Electron app and window events are kept. Vault also no longer writes your search text to its log.

### Changed (sign-in)
- **Google sign-in now opens in your normal browser** instead of a small window inside Vault. This is what Google requires of desktop apps, and it lets you use the Google accounts you are already signed in to. Microsoft and Dropbox sign-in are unchanged.

### Fixed
- The welcome banner on a fresh install said v1.0.0. It now shows the version you are running.

### Changed
- **Smaller Google Drive permission.** Vault now asks Google only to see file names, folders, dates and links (`drive.metadata.readonly`), not to read file contents (`drive.readonly`). Browsing, searching by file name and opening files work the same, because files open in your browser through their link. Accounts already connected keep working. Disconnect and reconnect a Google account to see the smaller permission on Google's consent screen.

---

## [1.0.2] — 2026-11-02

### Added
- **Update banner** — Vault now checks GitHub for a newer release each time it starts and shows a banner with a link to the download. Dismissing it hides that version only. If the check fails, nothing is shown.
- **Review on G2 banner** — a second, equal banner beside the feedback request, plus a Help menu item. Shown to every user the same way.

### Changed
- Privacy policy wording about update checks now matches the app (a check on launch, and on request from the Help menu).

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
