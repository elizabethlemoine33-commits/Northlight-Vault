# NORTHLIGHT VAULT — PRIVACY POLICY

**Effective Date: May 17, 2026**
**Last Updated: May 17, 2026**

---

## 1. WHO WE ARE

Northlight Vault is a desktop application developed and operated by Northlight.

**Legal Information:**
- Operator: Elizabeth Lemoine
- Business Registration: Pending (to be registered in Nova Scotia)
- Type: [Sole Proprietorship / Partnership / Corporation — TBD]

**Contact:**
support@bynorthlight.ca
bynorthlight.ca

**Physical Address:**
15 Kaleigh Drive
Eastern Passage, Nova Scotia B3G 1E3
Canada

---

## 2. OUR COMMITMENT TO YOUR PRIVACY

Northlight Vault is designed with privacy as a default. The app does not collect, transmit, or store your personal information on any Northlight servers. Everything stays on your device.

This policy explains how the app works with third-party cloud storage providers, what that means for your data, how we handle user feedback, and what rights you have as a Canadian user under the Personal Information Protection and Electronic Documents Act (PIPEDA).

---

## 3. INFORMATION WE COLLECT

### Personal Information in the App

Northlight Vault does not collect personal information from your use of the app. Your files, browsing activity, and preferences remain on your device.

The app stores the following locally on your device only:

**Authentication tokens (encrypted):**
- Access tokens and refresh tokens for connected cloud accounts are encrypted at rest using Windows Credential Manager via DPAPI (Data Protection API)
- Tokens are written directly to the Windows Credential Manager by Keytar (`node-keytar`)
- The operating system encrypts them, and they can only be decrypted during your active Windows session
- Tokens never exist as plain text on disk
- Tokens are deleted when you disconnect an account or uninstall Vault

**Account metadata (unencrypted):**
- Display name, email address, and account provider information (for sidebar display only) are stored unencrypted in `AppData\Roaming\northlight-vault\config.json`
- This metadata contains no sensitive credentials — only information needed to show your connected account list
- Metadata is deleted when you disconnect an account or uninstall Vault

**App preferences and settings:**
- UI preferences, sort order, and other non-sensitive settings

All stored data remains on your device and is not accessible to Northlight or transmitted to any server.

### Personal Information in Feedback

When you submit feedback through the in-app feedback form, we collect limited personal information to respond to you and improve the app. See Section 5 for full details on what we collect, how we use it, and your rights.

---

## 4. THIRD-PARTY CLOUD STORAGE PROVIDERS

To provide its core functionality, Northlight Vault connects to cloud storage services that you choose to authorise. Currently supported providers:

- Google Drive (Google LLC)
- Microsoft OneDrive (Microsoft Corporation)
- Dropbox (Dropbox, Inc.)

**How it works:** When you browse files in Vault, the app retrieves file lists and metadata (names, dates, folder structure, file types) directly from your connected cloud provider and displays them on your device. This data is processed locally and is not sent to Northlight or stored on Northlight servers.

**Your cloud provider's responsibility:** Each provider has its own privacy policy governing how they handle your data. We encourage you to review them:

- Google Drive: https://policies.google.com/privacy
- Microsoft OneDrive: https://privacy.microsoft.com
- Dropbox: https://www.dropbox.com/privacy

**Revoking access:** You can revoke Northlight Vault's access to any connected account at any time:

- **In Vault:** Disconnect your account by clicking the × next to the account name in the sidebar
- **Through your provider:**
  - Google Drive: https://myaccount.google.com/permissions
  - Microsoft OneDrive: https://account.microsoft.com/permissions
  - Dropbox: https://dropbox.com/account/connected_apps

---

## 5. USER FEEDBACK

When you submit feedback through the in-app feedback form, you provide consent before submission by checking a required consent box. We collect the following information:

**What we collect:**
- Your name (optional)
- Your email address (required)
- Feedback type (bug report, feature idea, general feedback)
- Cloud provider you were using (if applicable)
- Your feedback text
- Northlight Vault version number (if reporting a bug)

**How we use it:** We store this information in ClickUp, a task management platform, so we can review your feedback, respond to you, and improve Northlight Vault. We do not use your information for marketing, and we do not share it with third parties.

**Data location and security:** Your feedback is stored in ClickUp, which is hosted on Amazon Web Services (AWS). ClickUp stores data across multiple AWS regions including Oregon (US), Ohio (US), Sydney (Australia), Singapore, and Dublin (Ireland), but does not guarantee localization to a specific region. Your data may be stored in the United States or internationally.

ClickUp is SOC 2 Type II certified and is committed to compliance with global data protection legislation including GDPR, CCPA, Canada's Consumer Privacy Act, and others. By submitting feedback, you consent to your data being stored on ClickUp's servers, which may be in the United States or internationally, and subject to US and international jurisdiction.

ClickUp's privacy policy: https://clickup.com/privacy

**Your consent:** The feedback form displays a required consent checkbox that states: "I consent to Northlight storing my name, email, and feedback in their task management system to respond to me and improve Northlight Vault. I understand my data is stored in the United States."

By checking this box and clicking Submit, you explicitly consent to us storing your name, email, and feedback in ClickUp for these purposes.

**Your rights:** You may request deletion of your feedback at any time by contacting support@bynorthlight.ca. Include your email address and details of the feedback you submitted, and we will delete your data within 30 days of your request.

---

## 6. DATA RETENTION

**App data:** Northlight Vault does not collect personal information from app usage, so there is nothing to retain or delete on our end. Local app data (authentication tokens, preferences) can be removed at any time by uninstalling the application or disconnecting accounts within the app.

**Feedback data:** We retain user feedback for 12 months from the date of submission. After 12 months, all feedback is deleted automatically from our system, including your name, email, and feedback text. If you request deletion before this period ends, we will delete your feedback immediately upon receipt of your request.

---

## 7. ANALYTICS, CRASH REPORTING, AND SOFTWARE UPDATES

**Analytics:** Northlight Vault does not use analytics tools or collect data about how you use the app.

**Crash reporting (Sentry):** Northlight Vault uses Sentry to capture crash reports when the app encounters a critical error. This is the only data that leaves your device, and it is sent directly to Sentry — not to Northlight.

**What Sentry collects when the app crashes:**
- Error message and stack trace (the sequence of code that caused the crash)
- Native crash minidumps — a memory snapshot taken at the moment of the crash. These may contain local file paths or environment variable names that were in memory at the time. Sentry processes minidumps to generate a readable crash report and deletes the raw minidump automatically.
- Breadcrumbs — a short log of recent app events leading up to the crash (e.g., "opened folder", "error occurred")
- Device information — operating system name and version (e.g., Windows 11), CPU architecture (e.g., x64)
- App version number

**What Sentry does not collect:**
- OAuth tokens or credentials of any kind
- File names, folder names, or any content from your cloud storage
- Your search queries or browsing history
- Your email address or any personally identifying information

**Data location:** Sentry's servers are located in the European Union (`ingest.de.sentry.io`). Your crash data is subject to EU data protection laws and Sentry's privacy practices. You can review Sentry's privacy policy at https://sentry.io/privacy.

**Performance tracing:** Performance tracing is disabled. Sentry only activates when a crash or unhandled error occurs — it does not continuously monitor or transmit data about normal app usage.

**Software updates:** Northlight Vault includes an automatic update check that connects to GitHub to determine whether a newer version is available. This request is made directly between your device and GitHub's servers. Northlight does not log or store connection data from update checks. GitHub's privacy policy applies: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement

---

## 8. YOUR RIGHTS UNDER PIPEDA

As a Canadian resident, you have the right to:

- Know whether Northlight holds personal information about you
- Request access to any personal information we hold
- Request correction of inaccurate information
- Withdraw consent for the collection or use of your personal information
- Lodge a complaint with the Office of the Privacy Commissioner of Canada

To exercise any of these rights, or if you have privacy concerns, contact us at support@bynorthlight.ca. Please include relevant details (such as your email address if you submitted feedback).

**Office of the Privacy Commissioner of Canada:** https://www.priv.gc.ca

---

## 9. CHILDREN'S PRIVACY

Northlight Vault is not directed at anyone under the age of 18. If you are under 18, please do not use this app or submit feedback without parental consent.

---

## 10. CHANGES TO THIS POLICY

We will notify users of material changes to this privacy policy through in-app messages and updated release notes. Material changes include:

- Adding new data collection practices
- Changing data retention periods
- Adding or removing third-party data processors
- Changes to how we use or share personal information

Minor clarifications or corrections do not require notification. Continued use of the app after notification of material changes constitutes acceptance of the updated policy.

---

## 11. CONTACT US

Questions about this privacy policy or your privacy rights?

**Northlight**
support@bynorthlight.ca
bynorthlight.ca

15 Kaleigh Drive
Eastern Passage, Nova Scotia B3G 1E3
Canada
