import './SearchResults.css'

interface SearchResult {
  id: string
  name: string
  mimeType: string
  modifiedTime: string | null
  isFolder: boolean
  webViewLink: string | null
  accountId: string
  accountEmail: string
  accountName: string
}

interface Props {
  results: SearchResult[]
  loading: boolean
  query: string
  onSelectAccount: (accountId: string) => void
}

function fileIcon(mimeType: string, isFolder: boolean): string {
  if (isFolder) return '📁'
  if (mimeType.includes('document') || mimeType.includes('word')) return '📄'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('video')) return '🎬'
  if (mimeType.includes('audio')) return '🎵'
  return '📄'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function SearchResults({ results, loading, query, onSelectAccount }: Props): JSX.Element {
  if (loading) {
    return <div className="search-state">Searching all accounts…</div>
  }

  if (!query.trim()) {
    return <div className="search-state">Type to search across all your Google Drive accounts.</div>
  }

  if (results.length === 0) {
    return (
      <div className="search-state">
        No results for <strong>"{query}"</strong> across any connected account.
      </div>
    )
  }

  return (
    <div className="search-results">
      <div className="search-count">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</div>
      <table className="results-table">
        <thead>
          <tr>
            <th className="col-name">Name</th>
            <th className="col-account">Account</th>
            <th className="col-date">Modified</th>
            <th className="col-action"></th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr
              key={`${r.accountId}-${r.id}`}
              className="result-row"
              onClick={() => onSelectAccount(r.accountId)}
              title={`Go to ${r.accountName}'s Drive`}
            >
              <td className="col-name">
                <span className="file-icon">{fileIcon(r.mimeType, r.isFolder)}</span>
                {r.name}
              </td>
              <td className="col-account">
                <span className="account-badge">{r.accountName[0].toUpperCase()}</span>
                {r.accountEmail}
              </td>
              <td className="col-date">{formatDate(r.modifiedTime)}</td>
              <td className="col-action">
                {r.webViewLink && (
                  <button
                    className="open-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.api.openFile(r.webViewLink!)
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
    </div>
  )
}
