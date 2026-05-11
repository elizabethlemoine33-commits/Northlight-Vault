import { getValidAccessToken } from '../auth/microsoft'
import type { DriveFile } from './google'

const FOLDER_MIME = 'application/vnd.microsoft.folder'

interface GraphItem {
  id: string
  name?: string
  size?: number
  lastModifiedDateTime?: string
  webUrl?: string
  folder?: { childCount: number }
  file?: { mimeType?: string }
}

const SELECT = '$select=id,name,size,lastModifiedDateTime,webUrl,folder,file'

async function graphGet(url: string, accessToken: string): Promise<{ value: GraphItem[] }> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OneDrive API error ${response.status}: ${text}`)
  }
  return response.json() as Promise<{ value: GraphItem[] }>
}

function toFile(item: GraphItem): DriveFile {
  return {
    id: item.id,
    name: item.name ?? '(unnamed)',
    mimeType: item.file?.mimeType ?? (item.folder ? FOLDER_MIME : ''),
    size: item.size != null ? String(item.size) : null,
    modifiedTime: item.lastModifiedDateTime ?? null,
    isFolder: !!item.folder,
    webViewLink: item.webUrl ?? null
  }
}

export async function listFiles(accountId: string, folderId: string = 'root'): Promise<DriveFile[]> {
  const accessToken = await getValidAccessToken(accountId)

  const endpoint = folderId === 'root'
    ? `https://graph.microsoft.com/v1.0/me/drive/root/children?${SELECT}&$orderby=name&$top=200`
    : `https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(folderId)}/children?${SELECT}&$orderby=name&$top=200`

  const data = await graphGet(endpoint, accessToken)
  return data.value.map(toFile)
}

export async function searchFiles(accountId: string, query: string): Promise<DriveFile[]> {
  const accessToken = await getValidAccessToken(accountId)

  // Escape single quotes for OData query syntax
  const safeQuery = query.replace(/'/g, "''")
  const endpoint = `https://graph.microsoft.com/v1.0/me/drive/search(q='${safeQuery}')?${SELECT}&$top=25`

  const data = await graphGet(endpoint, accessToken)
  return data.value.map(toFile)
}
