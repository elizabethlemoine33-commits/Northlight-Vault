import { google } from 'googleapis'
import { getAuthenticatedClient } from '../auth/google'
import { getAccounts } from '../accounts'

export interface SearchResult {
  id: string
  name: string
  mimeType: string
  modifiedTime: string | null
  isFolder: boolean
  webViewLink: string | null  // URL to open the file in a browser tab
  accountId: string
  accountEmail: string
  accountName: string
}

const FOLDER_MIME = 'application/vnd.google-apps.folder'

async function searchOneAccount(
  accountId: string,
  accountEmail: string,
  accountName: string,
  query: string
): Promise<SearchResult[]> {
  const auth = await getAuthenticatedClient(accountId)
  const drive = google.drive({ version: 'v3', auth })

  // Escape single quotes in the query to prevent API errors
  const safeQuery = query.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

  const response = await drive.files.list({
    q: `name contains '${safeQuery}' and trashed = false`,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
    pageSize: 25,
    orderBy: 'modifiedTime desc'
  })

  return (response.data.files || []).map((f) => ({
    id: f.id ?? '',
    name: f.name ?? '(unnamed)',
    mimeType: f.mimeType ?? '',
    modifiedTime: f.modifiedTime ?? null,
    isFolder: f.mimeType === FOLDER_MIME,
    webViewLink: f.webViewLink ?? null,
    accountId,
    accountEmail,
    accountName
  }))
}

// Searches all connected accounts simultaneously and returns merged results.
// Uses Promise.allSettled so a failure in one account doesn't cancel the others.
export async function searchAllAccounts(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const accounts = getAccounts()
  if (accounts.length === 0) return []

  const searches = accounts.map((a) =>
    searchOneAccount(a.id, a.email, a.displayName, query)
  )

  const settled = await Promise.allSettled(searches)

  settled.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[search] account ${accounts[i].email} failed:`, r.reason)
    }
  })

  return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
