import { net } from 'electron'
import { getDropboxAccessToken } from '../auth/dropbox'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: string | null
  modifiedTime: string | null
  isFolder: boolean
  webViewLink: string | null
}

async function dropboxPost(
  accessToken: string,
  endpoint: string,
  body: unknown
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body)
    const request = net.request({
      method: 'POST',
      url: `https://api.dropboxapi.com/2/${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    let responseBody = ''
    request.on('response', (response) => {
      response.on('data', (chunk) => { responseBody += chunk.toString() })
      response.on('end', () => {
        try {
          const data = JSON.parse(responseBody)
          if (data.error_summary) {
            reject(new Error(`Dropbox API error: ${data.error_summary}`))
            return
          }
          resolve(data)
        } catch {
          reject(new Error(`Dropbox API response (status ${response.statusCode}): ${responseBody.slice(0, 200)}`))
        }
      })
    })
    request.on('error', reject)
    request.write(bodyStr)
    request.end()
  })
}

function entryToFile(entry: Record<string, unknown>): DriveFile {
  const isFolder = entry['.tag'] === 'folder'
  const id = (entry.id as string | undefined) ?? (entry.path_lower as string)
  const pathLower = entry.path_lower as string ?? ''

  return {
    id,
    name: entry.name as string,
    mimeType: isFolder ? 'application/x-dropbox-folder' : (entry.media_info ? 'image/unknown' : 'application/octet-stream'),
    size: isFolder ? null : String(entry.size ?? ''),
    modifiedTime: (entry.client_modified as string | undefined) ?? null,
    isFolder,
    webViewLink: isFolder
      ? null
      : `https://www.dropbox.com/home${pathLower}`
  }
}

export async function listFiles(accountId: string, folderId: string): Promise<DriveFile[]> {
  const accessToken = await getDropboxAccessToken(accountId)

  const folderPath = folderId === 'root' ? '' : folderId

  const data = await dropboxPost(accessToken, 'files/list_folder', {
    path: folderPath,
    recursive: false,
    include_media_info: false,
    include_deleted: false,
    include_has_explicit_shared_members: false,
    include_mounted_folders: true,
    limit: 200
  }) as Record<string, unknown>

  const entries = (data.entries as Record<string, unknown>[]) ?? []
  const files = entries.map(entryToFile)

  // Sort: folders first, then by name
  files.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1
    return a.name.localeCompare(b.name)
  })

  return files
}

export async function searchFiles(
  accountId: string,
  query: string
): Promise<(DriveFile & { accountId: string })[]> {
  const accessToken = await getDropboxAccessToken(accountId)

  const data = await dropboxPost(accessToken, 'files/search_v2', {
    query,
    options: {
      max_results: 20,
      file_status: 'active',
      filename_only: false
    }
  }) as Record<string, unknown>

  const matches = (data.matches as Array<{ metadata: { metadata: Record<string, unknown> } }>) ?? []

  return matches
    .map((m) => entryToFile(m.metadata.metadata))
    .map((f) => ({ ...f, accountId }))
}
