# Northlight — Coding Session Learnings

A living reference capturing decisions made, lessons learned, and step-by-step processes from our work on the Northlight site and Vault. Updated as sessions happen.

---

## Table of Contents

1. [Founding Principles](#1-founding-principles)
2. [Architectural Decisions Log](#2-architectural-decisions-log)
3. [Processes — Step-by-Step Runbooks](#3-processes--step-by-step-runbooks)
4. [Lessons Learned](#4-lessons-learned)
5. [Current State Snapshot](#5-current-state-snapshot)

---

## 1. Founding Principles

These are the core values that govern every technical decision. Consult this section first whenever a new tool, service, or integration is being evaluated.

---

### Data Residency Preference: Canada → EU → US

**Whenever we have a choice about where data is stored, the order of preference is:**

1. **Canada** — ideal, keeps us under PIPEDA jurisdiction
2. **European Union** — strong GDPR protections, acceptable second choice
3. **United States** — last resort only, and only when no alternative exists

This applies to: crash reporting services, feedback tools, databases, hosting platforms, authentication providers, email services — anything where we decide where data lands.

**How this has been applied:**
- Sentry crash reporting: chose EU region (`ingest.de.sentry.io`) over the US region
- ClickUp feedback storage: no Canadian or EU-guaranteed region available, but SOC 2 Type II certified and compliant with Canada's Consumer Privacy Protection Act — acceptable given no alternatives that fit our workflow
- GitHub Releases: US-based but functionally unavoidable for a desktop app distributed this way; the release download is infrastructure, not personal data storage

When a new service doesn't offer Canada or EU, document why the US option was accepted as a trade-off rather than treating it as a default.

*Established before May 16, 2026*

---

### Privacy-First: Collect Only What You Need

**We collect the minimum personal data required to deliver the product and nothing more.**

This means:
- No analytics, even privacy-respecting ones, unless a specific product decision requires them
- No "nice to have" data — every data point collected must have a clear, documented purpose
- When a feature could work with or without collecting personal data, design it without
- If a third-party service requires us to share data we wouldn't otherwise collect, question whether we need that service

**How this has been applied:**
- No analytics on the website or in the Vault app
- Feedback form collects name (optional), email, feedback type, provider, and text — and nothing else
- Crash reporting (Sentry) collects only what's needed to diagnose a crash; performance tracing disabled
- Account metadata stored locally is intentionally minimal (display name, email, provider — enough to show the sidebar, nothing more)

*Established before May 16, 2026*

---

### Accessibility Is Not Optional

Build accessible interfaces from the start. Adding accessibility after the fact is harder than doing it right the first time, and it is the right thing to do.

**Minimum standards for every page/screen:**
- Skip navigation link (for keyboard and screen reader users)
- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<footer>`, proper heading hierarchy)
- All interactive elements reachable by keyboard
- `aria-label` or `aria-labelledby` on regions that need context
- `aria-hidden="true"` or `role="presentation"` on purely decorative elements
- Modal dialogs: `role="dialog"`, `aria-modal="true"`, focus trapped inside while open, focus returned on close
- Images: meaningful `alt` text (describe what the image shows), or `alt=""` for decorative ones

*Established May 18, 2026*

---

## 2. Architectural Decisions Log

Each decision in the format: **What / Why / What we ruled out / Date**.

---

### GitHub Pages for site hosting

**Decision:** Host bynorthlight-site on GitHub Pages with a custom domain (`bynorthlight.ca`).

**Why:** Zero cost, zero server maintenance, zero deployment pipeline for a static site. Files pushed to main go live automatically. Since the codebase is already on GitHub, it's the tightest possible workflow — no third-party hosting service to set up.

**Alternatives ruled out:** Vercel and Netlify are excellent but add unnecessary complexity (build settings, deploy configs, a third login) for a site with no build step whatsoever.

*May 16, 2026*

---

### Static HTML/CSS — no framework

**Decision:** Pure HTML and CSS files. No React, no Next.js, no Vite, no npm, no build process.

**Why:** The site is a landing page, a product page, and a policy page. There's nothing interactive except a toggle button and a screenshot lightbox. A framework would add node_modules, a build command, a `package.json` to maintain, and a deployment pipeline — for zero user-facing benefit. When the site grows to warrant it, we can revisit.

**Alternatives ruled out:** React/Next.js (massive overkill), Astro (sensible but still a build step we don't need yet).

*May 16, 2026*

---

### CSS custom properties for the design system

**Decision:** All brand colors defined as CSS variables in `:root`, with semantic names tied to the aurora palette.

**Why:** Semantic names (`--glacial`, `--boreal`, `--dusk`, `--aurora`) make the code readable — you can see the intent, not just a hex value. When a color needs to change, one line updates the whole site. Avoids magic numbers scattered through the CSS.

**The full palette:**
```css
--midnight:   #0E0E14   /* page background */
--surface:    #12121E   /* elevated card/panel backgrounds */
--surface-2:  #10101C   /* secondary surface level */
--border:     #1E2035   /* subtle dividers */
--border-2:   #2A2A48   /* more visible borders */
--text:       #FFFFFF   /* primary text */
--cloud:      #C8CCE0   /* body text */
--haze:       #B0B8D8   /* secondary text */
--muted:      #8A92A8   /* placeholder, disabled */
--structural: #5A6080   /* UI chrome, labels */
--glacial:    #4FC3C8   /* cyan accent */
--boreal:     #5B8DD9   /* blue accent */
--dusk:       #8B6FD4   /* purple accent */
--aurora:     #C46FAA   /* magenta accent */
```

**Aurora gradient** (used on top bar, wordmark, accent lines):
```css
linear-gradient(90deg, #4fc3c8 0%, #5b8dd9 30%, #8b6fd4 65%, #c46faa 100%)
```

*May 16, 2026*

---

### Typography: Jost (display) + Outfit (body)

**Decision:** Two Google Fonts — Jost for headings, labels, and UI elements; Outfit for body copy.

**Why:** Jost is geometric and modern with excellent letter-spacing for display use. Outfit is clean and humanist — more readable at body sizes. The combination creates visual hierarchy without feeling heavy. Both are free via Google Fonts.

**Load pattern used:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
```

`preconnect` is important — it warms up the DNS and TLS connection to Google Fonts before the browser parses the stylesheet, reducing load time.

*May 16, 2026*

---

### Dark-only theme

**Decision:** The site is dark mode only. No light/dark toggle.

**Why:** The Northlight brand is built around a dark, northern aesthetic. Adding a light mode doubles the CSS to maintain and introduces edge cases in gradient rendering. The audience browsing a consultancy site won't be surprised by a dark theme. If light mode becomes genuinely needed, it's a future project.

*May 16, 2026*

---

### Sentry for crash reporting — EU region

**Decision:** Use Sentry for Vault crash reporting. Selected EU region (`ingest.de.sentry.io`) at project creation.

**Why:** Crash visibility is essential for a production app. Without it, bugs appear only when users email to complain. Sentry is the industry standard and has excellent Electron support. EU region was chosen so crash data is subject to GDPR rather than US law — aligns with our data residency principle and privacy-first positioning.

**Key configuration choices:**
- Performance tracing disabled (`tracesSampleRate: 0`) — Sentry only activates on crashes, not during normal use
- This is the *only* data that leaves a user's device automatically
- Raw minidumps are processed by Sentry and deleted; only the readable crash report is retained

**Alternatives ruled out:** No crash reporting (unacceptable blind spots in production). US Sentry region (violates data residency preference). Bugsnag (also good, but Sentry's Electron SDK is more mature).

*May 17, 2026*

---

### ClickUp for feedback storage

**Decision:** User feedback from the in-app form is stored in ClickUp (task management platform).

**Why:** ClickUp is already in use as our task manager, so no new tool, no new login, no new subscription. It's SOC 2 Type II certified, GDPR/CCPA/CPPA compliant, and multi-region AWS. Feedback arrives directly in the workflow where we'd action it anyway.

**Data stored:** name (optional), email, feedback type, cloud provider, feedback text, app version. 12-month retention.

**Data residency note:** ClickUp cannot guarantee data stays in a specific region. We disclosed this explicitly in the privacy policy: "Your data may be stored in the United States or internationally." This was an acceptable trade-off because no equivalent tool offers guaranteed Canadian storage, ClickUp has strong compliance certifications, and explicit consent covers the cross-border transfer.

*May 16, 2026*

---

### Windows Credential Manager / DPAPI for OAuth token storage

**Decision:** OAuth tokens for cloud provider accounts are stored in Windows Credential Manager using the `keytar` (node-keytar) library, which writes via DPAPI (Data Protection API).

**Why:** DPAPI is OS-level encryption tied to the Windows user session. Tokens cannot be read from disk — they're only decryptable during an active Windows session for that user. This means tokens never exist as plain text, and are automatically protected without us managing encryption keys.

**Key detail:** Account metadata (display name, email, provider) is stored unencrypted in `AppData\Roaming\northlight-vault\config.json` — this is intentional. That data contains no credentials; it's only needed to display the connected account list in the sidebar.

**Alternatives ruled out:** Plain file storage (insecure), SQLite (still plain text without additional encryption layer), custom encryption (unnecessary when the OS provides it).

**macOS note:** Keytar uses macOS Keychain on Mac (same library, different OS backend). Mac support is a future addition.

*May 16, 2026*

---

### GitHub Releases for distributing the Windows installer

**Decision:** Distribute the Vault `.exe` installer via GitHub Releases, not a custom download server or file host.

**Why:** GitHub Releases is the standard for Electron apps and open-source software. It provides a stable, versioned URL pattern, automatic hosting, and integrates with the existing codebase. The `latest` URL pattern means the download button always points to the current version without needing to update the website for each release.

**URL pattern:**
```
https://github.com/elizabethlemoine33-commits/Northlight-Vault/releases/latest/download/Northlight.Vault.Setup.1.0.0.exe
```

Note: when the version number in the filename changes (e.g., `1.0.1`), the website download link will need to be updated too. The `/releases/latest/download/` prefix handles routing to the most recent release, but only if the filename matches exactly what was uploaded.

**Alternatives ruled out:** Hosting the `.exe` in the GitHub Pages repo (binary files don't belong in a web repo — they inflate repository size and don't version cleanly). A separate file hosting service (extra infrastructure, extra cost, no versioning).

*May 18, 2026*

---

### Google OAuth app: In Production, not yet verified

**Decision:** Move the Vault Google OAuth app from "Testing" status to "In production" in the Google Cloud Console, even though Google verification has not been completed.

**Why:** In Testing mode, only explicitly added test users (up to 100) can authenticate with the app. Moving to In Production removes this limit and allows any Google user to connect their Drive. Since Vault is now publicly available, the 100-user limit was a blocker.

**The trade-off:** Apps in production that haven't completed Google's verification process show users a "This app hasn't been verified" warning screen. Users must click "Advanced" → "Go to Northlight Vault (unsafe)" to proceed. We added a note on the download page explaining this.

**What Google verification involves:**
- Verification is required if your app requests sensitive or restricted Google API scopes
- For Google Drive access, the scopes used determine whether verification is required or just strongly encouraged
- The verification process involves submitting your app for Google's review, providing a privacy policy URL, and demonstrating how OAuth data is used
- Timeline: can take weeks to months

**Current state:** We have disclosed the warning in the product UI and on the website. Verification is the next step for a polished user experience.

*May 18, 2026*

---

### `noindex, nofollow` on the privacy policy page

**Decision:** `vault-privacy.html` has `<meta name="robots" content="noindex, nofollow">`.

**Why:** The privacy policy should be findable by users via the footer link, but it shouldn't appear in Google search results. Legal pages indexed by search engines can create confusion (outdated versions cached, taken out of context). Users who need it can find it; robots shouldn't index it.

*May 16, 2026*

---

### PIPEDA compliance framing

**Decision:** The privacy policy is written to satisfy PIPEDA (Personal Information Protection and Electronic Documents Act) — Canada's federal privacy law.

**Why:** Elizabeth is based in Nova Scotia, Canada. PIPEDA is the applicable federal law. Nova Scotia doesn't have a provincial private-sector privacy law, so PIPEDA applies directly. The policy addresses all ten PIPEDA fair information principles: accountability, identifying purposes, consent, limiting collection, limiting use/disclosure/retention, accuracy, safeguards, openness, individual access, and challenging compliance.

**GDPR note:** We're not in the EU, but Sentry's EU servers bring crash data under GDPR's jurisdiction — which is a stronger protection than PIPEDA. No extra work required; the stricter law applies automatically.

*May 16, 2026*

---

### GitHub API for software update checks

**Decision:** Vault checks for new versions by connecting directly to GitHub's API.

**Why:** This makes the update check a device-to-GitHub connection. Northlight has no server in the middle logging who is checking for updates when. It's private by design. GitHub is already where releases are published, so no additional infrastructure is needed.

*May 16, 2026*

---

### No analytics

**Decision:** No analytics tools on the website or in the Vault app.

**Why:** Analytics tracking would contradict Vault's core value proposition — a privacy-first local app. Even privacy-respecting analytics (Plausible, Fathom) would require disclosing data leaving the device. The cost of not having analytics is that we rely on user feedback for product signal. That's an acceptable trade-off, and aligns with the privacy-first principle.

*May 16, 2026*

---

## 3. Processes — Step-by-Step Runbooks

---

### Process A: Starting a new coding project — the right setup order

Do these in order at the start of every new project. Doing them out of order creates rework.

1. **Decide on data residency preferences upfront** — before choosing any tools or services. Write down: what data will this project collect or process? For each category, what are the options for where it's stored? Apply the Canada → EU → US preference.

2. **Create the GitHub repository first** (see Process C below), before writing any code. This prevents "now I have to connect an existing folder to GitHub" fumbling.

3. **Add `.gitignore` before the first real commit.** Common entries:
   ```
   node_modules/
   .env
   .env.local
   dist/
   out/
   *.exe
   *.dmg
   .DS_Store
   ```

4. **Draft a basic privacy policy outline** before you have users — even just bullet points. It forces you to enumerate what data you're collecting. You'll write the real policy later, but having the outline means the policy won't surprise you.

5. **Set up Sentry before you ship**, not after. It takes 30 minutes and you need it from day one of production. See Process E.

6. **Set up GitHub Releases** before you publish a download link. See Process F.

7. **Add accessibility basics** to every page before it goes live: skip nav, semantic headings, ARIA labels on interactive elements. Retrofitting is slower.

8. **Update the privacy policy** every time you add a new third-party service. Do it the same day, not later.

---

### Process B: Setting up GitHub Pages with a custom domain

This process caused the most confusion in our first session. The critical insight: the CNAME file in the repo and the DNS record at your registrar are two completely different things.

**The correct order:**

1. **Create your repository** on GitHub and push your initial files.

2. **Enable GitHub Pages:**
   - Repository → Settings → Pages
   - Under "Source": Deploy from a branch → `main` branch → `/ (root)` folder → Save

3. **Add the CNAME file to your repo** — a file named `CNAME` (no extension) in the root containing only your domain:
   ```
   bynorthlight.ca
   ```
   No `https://`, no `www`, no trailing slash. Just the bare domain.

4. **Set the DNS record at your registrar** (the step that's easy to miss):
   - Log into your domain registrar (Namecheap, Google Domains, Cloudflare, etc.)
   - For an apex domain (no `www`): add four A records pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or: add a CNAME record for `www` pointing to `elizabethlemoine33-commits.github.io`

5. **Wait for DNS to propagate.** This can take anywhere from a few minutes to 48 hours. Deleting and recreating the CNAME file in the repo does nothing during this wait — that's a GitHub-side config, not DNS.

6. **Verify propagation:**
   ```bash
   dig bynorthlight.ca
   ```
   You should see GitHub's IPs in the answer. Until you do, the site won't resolve on the custom domain.

7. **In GitHub Pages settings**, enter your custom domain in the "Custom domain" field. Must match the CNAME file exactly.

8. **Enforce HTTPS** — the checkbox only becomes available after GitHub provisions an SSL certificate, which happens automatically once DNS resolves. If it's greyed out, DNS hasn't propagated yet.

**Why we hit problems:** Three CNAME creates and two deletes within 30 minutes during the first session. That was solving the wrong problem — the CNAME file was correct each time. The actual wait was for DNS to propagate. Recreating the repo file didn't fix anything. Once DNS resolved, everything worked.

---

### Process C: Setting up a new GitHub repository

1. **GitHub → New repository**
   - Choose the correct owner (personal account vs. organisation)
   - Name it clearly (e.g., `bynorthlight-site`, `northlight-vault`)
   - Visibility: Public for open source / GitHub Pages sites; Private for app code
   - **Do NOT initialise with a README if you're pushing an existing local project** — it creates a merge conflict on first push

2. **Connect your local project:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/elizabethlemoine33-commits/YOUR-REPO.git
   git branch -M main
   git push -u origin main
   ```

3. **Set up branch protection** for repos you care about:
   - Settings → Branches → Add branch protection rule
   - Pattern: `main`
   - Enable "Require a pull request before merging" if working with others

4. **For GitHub Pages sites**, follow Process B after the initial push.

---

### Process D: Setting up Google Cloud Console for OAuth (Google Drive)

Use this when adding Google Drive integration to a desktop or web app.

**Part 1: Create the project and enable the API**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (top nav → project selector → New Project)
   - Name it clearly: e.g., "Northlight Vault"
3. With the project selected, go to **APIs & Services → Library**
4. Search for "Google Drive API" → Enable it
5. Also enable the "People API" if you need to retrieve the user's name/email for display purposes

**Part 2: Configure the OAuth consent screen**

1. APIs & Services → OAuth consent screen
2. User type: **External** (for apps used by general Google account holders)
3. Fill in:
   - **App name**: Northlight Vault
   - **User support email**: support@bynorthlight.ca
   - **App logo**: upload the 512×512 app icon
   - **App domain** → Application home page: `https://bynorthlight.ca/vault.html`
   - **App domain** → Privacy policy link: `https://bynorthlight.ca/vault-privacy.html`
   - **App domain** → Terms of service: (add when you have a ToS page)
   - **Developer contact email**: elizabeth@bynorthlight.ca

4. **Scopes** — Add the Drive scopes your app needs:
   - `https://www.googleapis.com/auth/drive.readonly` — read-only access (preferred if you only browse/open files)
   - `https://www.googleapis.com/auth/drive.metadata.readonly` — metadata only (even more restricted)
   - Stick to the minimum scope that makes the app work — Google requires justification for broader scopes

5. **Test users** (while in Testing status): add any email addresses that need to test the app. Limited to 100 users.

**Part 3: Create OAuth credentials**

1. APIs & Services → Credentials → Create Credentials → **OAuth 2.0 Client ID**
2. Application type: **Desktop app** (for an Electron app, not "Web application")
3. Name it: "Northlight Vault Desktop"
4. Download the JSON file — this contains your `client_id` and `client_secret`
5. **Never commit this JSON file to a public repository** — add it to `.gitignore` immediately

**Part 4: Move from Testing to In Production**

When you're ready to allow any Google user to authenticate (not just test users):

1. APIs & Services → OAuth consent screen
2. Click **Publish App** → Confirm
3. The app status changes from "Testing" to "In production"
4. Users without Google Workspace accounts can now authenticate
5. **The unverified app warning will appear** until Google verification is completed (see Lesson below)

**Part 5: Storing credentials in the app**

- Store `client_id` in an environment variable or config that isn't committed to the repo
- `client_secret` must never appear in code that ships to users — for a desktop app, you need to handle this carefully (Electron apps can be decompiled; consider using PKCE flow for public clients instead of a client secret)

---

### Process E: Adding Sentry to an Electron app

1. **Create a Sentry project:**
   - sentry.io → New Project → Select "Electron"
   - **Select EU region when prompted — this cannot be changed later.** EU region uses `ingest.de.sentry.io` endpoint.
   - Name the project (e.g., `northlight-vault`)

2. **Copy your DSN** (looks like `https://xxxx@ingest.de.sentry.io/xxxx`)

3. **Install:**
   ```bash
   npm install @sentry/electron
   ```

4. **Initialize in the main process** (before other requires):
   ```js
   const { init } = require('@sentry/electron/main');
   init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 0,  // crashes only — no performance monitoring
   });
   ```

5. **Initialize in the renderer process** if needed:
   ```js
   import * as Sentry from '@sentry/electron/renderer';
   Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 });
   ```

6. **Test:** throw a deliberate error in development, verify it appears in the Sentry dashboard, delete the test line.

7. **Update the privacy policy** the same day. Disclose: that Sentry is used, when it activates (crashes only), what it collects, what it does not collect, where data is stored (EU), and link to Sentry's privacy policy.

---

### Process F: Setting up GitHub Releases for distributing a Windows installer

1. **Build your installer** (in Electron: `electron-builder` or `electron-forge` produces a `.exe` Setup file)

2. **Create a GitHub Release:**
   - Go to your repo → Releases (right sidebar) → Draft a new release
   - **Tag version**: create a new tag, e.g., `v1.0.0` (semantic versioning)
   - **Release title**: `Northlight Vault v1.0.0`
   - **Description**: write release notes — what's new, what's fixed
   - **Attach the `.exe` file** by dragging it into the assets area
   - Publish the release

3. **The download URL pattern:**
   ```
   https://github.com/OWNER/REPO/releases/latest/download/FILENAME.exe
   ```
   The `latest` segment always resolves to the most recent published release. The filename must match exactly what you uploaded.

4. **Point the website download button at this URL.** When the version number changes in the filename (e.g., v1.0.0 → v1.0.1), update the URL in `vault.html` to match.

5. **For the `releases/latest/download/` redirect to work**, the file must be attached to the most recent non-draft, non-prerelease release. If you publish a prerelease, `/latest/` won't point to it.

---

### Process G: Writing a PIPEDA-compliant privacy policy

Use this checklist for any future app or service.

**Required sections:**
- [ ] **Who you are** — operator name, business status, contact email, physical address, website
- [ ] **What you collect** — split clearly: local-only data / transmitted data / feedback data. Specify what is encrypted vs. unencrypted and why.
- [ ] **Third-party processors** — each one named with: what they do, where they store data, their compliance certifications, link to their privacy policy
- [ ] **Consent mechanism** — how users consent to each data type (explicit checkbox for feedback; in-policy disclosure for crash reporting)
- [ ] **Data retention** — specific time periods ("12 months from submission date"), not vague language
- [ ] **User rights under PIPEDA** — all five: know what's held, access, correction, withdrawal of consent, complaint to OPC
- [ ] **Contact for exercising rights** — a real monitored email address
- [ ] **How you notify of material changes** — in-app messages, release notes, email
- [ ] **Children's privacy** — a statement about minimum age

**Material changes that require notifying users:**
- Adding new data collection
- Changing retention periods
- Adding or removing third-party processors
- Changing how data is used or shared

**Important:** update the privacy policy the same day you add a new third-party service. Don't batch it for later.

---

## 4. Lessons Learned

---

### DNS and GitHub Pages: the CNAME file is not the DNS record

The CNAME file in your repository tells GitHub what custom domain to serve the site on. It is a GitHub configuration. It has nothing to do with your domain registrar or DNS propagation.

The DNS record at your registrar is what routes traffic from your domain to GitHub's servers. That's where the actual wait is.

When the custom domain doesn't work after adding the CNAME file: check the registrar, not the repo. Run `dig yourdomain.com` — if it still shows the registrar's default servers instead of GitHub's IPs, you're waiting on propagation and nothing you do in the repo will change that.

*May 16, 2026*

---

### The Google "This app hasn't been verified" warning

When a Google OAuth app is in production but hasn't completed Google's verification process, users see a warning screen: "This app hasn't been verified. It has requested access to sensitive info in your Google Account."

**What it means:** Google hasn't reviewed the app's use of OAuth scopes. It does not mean the app is malicious — it means the review hasn't happened yet. All new apps show this warning.

**What users need to do:** Click "Advanced" → "Go to [app name] (unsafe)". Despite the word "unsafe," this is the standard path for legitimate unverified apps.

**What to do about it:**
- Add a clear note on the download page and/or in-app explaining what to expect and what to click. We added: "Connecting Google Drive? Google may show a 'This app hasn't been verified' warning. Click Advanced, then Go to Northlight Vault to continue."
- Begin the verification process when resources allow (see below)

**The verification process:**
- Submit via Google API Console → OAuth consent screen → "Prepare for verification"
- Requires: a working privacy policy URL, a demo video showing how OAuth data is used, justification for each scope requested
- Timeline: weeks to months, can involve back-and-forth with Google reviewers
- Once verified, the warning goes away for users

**Tip:** Request only the narrowest scopes you actually need. Requesting `drive.readonly` instead of `drive` means less scrutiny and faster verification.

*May 18, 2026*

---

### GitHub Releases: "latest" only works for published non-prerelease releases

The URL `/releases/latest/download/FILENAME.exe` is convenient but has a catch: it resolves to the most recent release that is not marked as a prerelease and is not a draft. If you accidentally publish a prerelease, the `/latest/` redirect won't update. Always double-check the release settings before publishing.

Also: if the filename changes between versions (e.g., `Northlight.Vault.Setup.1.0.0.exe` → `Northlight.Vault.Setup.1.0.1.exe`), the URL in the website must be updated too. The `/latest/` redirects correctly, but only to files with the exact filename that was uploaded.

*May 18, 2026*

---

### Write the third-party dependency list before writing the privacy policy

The Sentry section was added to the privacy policy the day after the initial version was published, because the decision to add Sentry came after the policy was first drafted. This required an immediate update and made the effective date confusing.

Better process: before writing the privacy policy, list every third-party service the app will use. Then write the policy to cover all of them. Updating for new integrations added later is fine — it's just avoidable rework when those services were already planned.

*May 17, 2026*

---

### Semantic color names make CSS maintainable

Using `--glacial`, `--boreal`, `--dusk`, `--aurora` instead of `--blue-1`, `--blue-2`, `--purple`, `--pink` means you can read the intent of any style rule without looking up the palette. `color: var(--structural)` tells you this is UI chrome at a glance. `color: #5A6080` tells you nothing.

Rule: semantic names should describe role, not shade. `--muted` is better than `--gray-3`. If you add a new color, name it by what it's for.

*May 16, 2026*

---

### `nextSibling.textContent` beats index-based DOM navigation

The address toggle button updates its label between "Show address" and "Hide address". An earlier version used `parentNode.childNodes[2].nodeValue` — this works but is brittle because it depends on the DOM having exactly the right node structure. The current version uses `btn.querySelector('.toggle-icon').nextSibling.textContent`, which is explicit and survives whitespace changes or HTML restructuring.

General rule: use the most direct, semantic DOM reference available. Index-based navigation is fragile.

*May 17, 2026*

---

### Accessibility: add it at the start, not as a retrofit

Several accessibility improvements were added when the site was rebuilt for the Vault launch: skip navigation links, semantic heading hierarchy (switching `<div class="wordmark">` to `<h1>`), `aria-hidden` on decorative elements, `role="dialog"` and focus trapping in the screenshot lightbox. These were straightforward to add alongside the rebuild.

The lesson is that retrofitting accessibility is always slower than building it in. A skip nav link is 10 lines of CSS and one HTML element — trivial to add when building the page, annoying to add later when you have to check whether it breaks layout.

*May 18, 2026*

---

### The lightbox focus trap pattern

When building a modal or lightbox, three things are required for accessibility:
1. When the modal opens, move focus to the first focusable element inside it
2. While the modal is open, tab/shift-tab must cycle within the modal only (not behind it)
3. When the modal closes, return focus to the element that triggered it

The pattern we used for the screenshot lightbox:
```js
// Open: move focus in
lb.querySelector('.lightbox-close').focus();

// Trap focus within
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Tab') {
    const focusable = lb.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (e.key === 'Escape') { /* close */ }
});
```

*May 18, 2026*

---

### Minidumps contain more than you think

Sentry's native crash minidumps — taken at the moment of a crash — can contain file paths and environment variable names that were in memory at crash time. Sentry processes them to generate a readable crash report, then deletes the raw minidump.

This is fine for our use case, but it's worth knowing when writing the privacy policy. We document it explicitly: "These may contain local file paths or environment variable names that were in memory." Transparency is better than a user discovering this later.

*May 17, 2026*

---

## 5. Current State Snapshot

*Last updated: May 20, 2026*

**Website:**
- Live at [bynorthlight.ca](https://bynorthlight.ca)
- GitHub Pages hosting, custom domain working, HTTPS enforced
- Three pages:
  - `index.html` — landing page with Vault card and laptop mockup
  - `vault.html` — Vault product page with download button, screenshots, lightbox, how it works
  - `vault-privacy.html` — privacy policy (Sentry section added May 17)
- App icon and 4 screenshots live in the repo root

**Vault desktop app:**
- **v1.0.0 shipped** — available for download from vault.html
- Windows only at this stage
- Installer: `Northlight.Vault.Setup.1.0.0.exe` on GitHub Releases
- Integrates with Google Drive, OneDrive, Dropbox via OAuth
- Crash reporting via Sentry (EU), feedback via ClickUp, updates via GitHub

**Google OAuth:**
- Status: **In production, not verified**
- Users see "This app hasn't been verified" warning when connecting Google Drive
- Warning is disclosed on the vault.html download page
- Verification process not yet started — next step for polished UX

**Business:**
- Operating as Northlight, sole proprietor (Elizabeth Lemoine)
- Business registration pending, Nova Scotia
- Contact: elizabeth@bynorthlight.ca (general), support@bynorthlight.ca (Vault support)

**Open items:**
- Google OAuth verification
- Business registration
- macOS support for Vault (Keytar/Keychain backend exists; needs testing and build)
- Terms of Service page (referenced in Google consent screen config but not yet written)
- Vault v1.0.1 / next version when needed

---

*Update this document at the end of any significant session.*
