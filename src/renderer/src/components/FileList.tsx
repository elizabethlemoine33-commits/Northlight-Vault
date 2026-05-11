import { useEffect, useState } from 'react'
import './FileList.css'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: string | null
  modifiedTime: string | null
  isFolder: boolean
  webViewLink: string | null
}

interface BreadcrumbItem {
  id: string
  name: string
}

interface Props {
  accountId: string
  accountName: string
}

function formatSize(bytes: string | null): string {
  if (!bytes) return '—'
  const n = parseInt(bytes)
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function fileIcon(file: DriveFile): string {
  if (file.isFolder) return '📁'
  const mt = file.mimeType
  if (mt.includes('document') || mt.includes('word')) return '📄'
  if (mt.includes('spreadsheet') || mt.includes('excel')) return '📊'
  if (mt.includes('presentation') || mt.includes('powerpoint')) return '📑'
  if (mt.includes('pdf')) return '📕'
  if (mt.includes('image')) return '🖼️'
  if (mt.includes('video')) return '🎬'
  if (mt.includes('audio')) return '🎵'
  if (mt.includes('zip') || mt.includes('compressed')) return '🗜️'
  return '📄'
}

export function FileList({ accountId, accountName }: Props): JSX.Element {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Breadcrumb trail: stack of { id, name } — root is always first
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { id: 'root', name: accountName }
  ])

  const currentFolder = breadcrumb[breadcrumb.length - 1]

  useEffect(() => {
    loadFiles(currentFolder.id)
  }, [currentFolder.id, accountId])

  async function loadFiles(folderId: string) {
    setLoading(true)
    setError(null)
    try {
      const result = await window.api.listFiles(accountId, folderId)
      setFiles(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load files.')
    } finally {
      setLoading(false)
    }
  }

  function openFolder(folder: DriveFile) {
    setBreadcrumb((prev) => [...prev, { id: folder.id, name: folder.name }])
  }

  function navigateToBreadcrumb(index: number) {
    setBreadcrumb((prev) => prev.slice(0, index + 1))
  }

  return (
    <div className="file-list-container">
      {/* Breadcrumb trail */}
      <div className="breadcrumb">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.id}>
            {i > 0 && <span className="breadcrumb-sep">›</span>}
            <button
              className={`breadcrumb-item ${i === breadcrumb.length - 1 ? 'active' : ''}`}
              onClick={() => navigateToBreadcrumb(i)}
              disabled={i === breadcrumb.length - 1}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* File table */}
      {loading && (
        <div className="state-message">Loading…</div>
      )}

      {error && (
        <div className="state-message error">
          <strong>Could not load files</strong><br />{error}
        </div>
      )}

      {!loading && !error && files.length === 0 && (
        <div className="state-message">This folder is empty.</div>
      )}

      {!loading && !error && files.length > 0 && (
        <table className="file-table">
          <thead>
            <tr>
              <th className="col-name">Name</th>
              <th className="col-size">Size</th>
              <th className="col-date">Modified</th>
              <th className="col-action"></th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr
                key={file.id}
                className={file.isFolder ? 'row-folder' : 'row-file'}
                onClick={() => file.isFolder && openFolder(file)}
              >
                <td className="col-name">
                  <span className="file-icon">{fileIcon(file)}</span>
                  {file.name}
                </td>
                <td className="col-size">{file.isFolder ? '—' : formatSize(file.size)}</td>
                <td className="col-date">{formatDate(file.modifiedTime)}</td>
                <td className="col-action">
                  {!file.isFolder && file.webViewLink && (
                    <button
                      className="open-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.api.openFile(file.webViewLink!)
                      }}
                      title="Open in browser"
                    >
                      Open
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
