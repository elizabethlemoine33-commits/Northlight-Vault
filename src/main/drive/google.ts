import { google } from 'googleapis'
import { getAuthenticatedClient } from '../auth/google'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: string | null       // null for folders and Google Docs (they have no file size)
  modifiedTime: string | null
  isFolder: boolean
}

const FOLDER_MIME = 'application/vnd.google-apps.folder'

// Lists files inside a folder. Pass folderId = 'root' to list the Drive root.
export async function listFiles(accountId: string, folderId: string = 'root'): Promise<DriveFile[]> {
  const auth = await getAuthenticatedClient(accountId)
  const drive = google.drive({ version: 'v3', auth })

  const response = await drive.files.list({
    // Only list files whose parent is the requested folder, exclude trashed files
    q: `'${folderId}' in parents and trashed = false`,
    // Request only the fields we need (keeps the response small and fast)
    fields: 'files(id, name, mimeType, size, modifiedTime)',
    // Show folders first, then alphabetically by name
    orderBy: 'folder,name',
    pageSize: 200
  })

  const files = response.data.files || []

  return files.map((f) => ({
    id: f.id ?? '',
    name: f.name ?? '(unnamed)',
    mimeType: f.mimeType ?? '',
    size: f.size ?? null,
    modifiedTime: f.modifiedTime ?? null,
    isFolder: f.mimeType === FOLDER_MIME
  }))
}
