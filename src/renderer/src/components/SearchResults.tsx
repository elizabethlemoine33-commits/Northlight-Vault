import './SearchResults.css'
import {
  DATE_RANGE_OPTIONS,
  DEFAULT_FILTERS,
  FILE_TYPE_OPTIONS,
  PER_ACCOUNT_RESULT_LIMIT,
  activeFilterCount,
  applyFilters,
  fileTypeOf,
  hitResultLimit,
  type DateRangeKey,
  type FileTypeKey,
  type SearchFilters
} from '../lib/searchFilters'

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

interface AccountOption {
  id: string
  email: string
}

interface Props {
  results: SearchResult[]
  loading: boolean
  query: string
  accounts: AccountOption[]
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSelectAccount: (accountId: string) => void
}

const TYPE_ICONS: Record<FileTypeKey, string> = {
  folder: '📁',
  document: '📄',
  spreadsheet: '📊',
  presentation: '📑',
  pdf: '📕',
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  other: '📄'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function SearchResults({
  results,
  loading,
  query,
  accounts,
  filters,
  onFiltersChange,
  onSelectAccount
}: Props): JSX.Element {
  if (loading) {
    return <div className="search-state">Searching all accounts…</div>
  }

  if (!query.trim()) {
    return <div className="search-state">Type to search across all your connected accounts.</div>
  }

  if (results.length === 0) {
    return (
      <div className="search-state">
        No results for <strong>"{query}"</strong> across any connected account.
      </div>
    )
  }

  const filterCount = activeFilterCount(filters)
  const clearFilters = (): void => onFiltersChange(DEFAULT_FILTERS)
  const shown = applyFilters(results, filters)
  const capped = hitResultLimit(results)

  return (
    <div className="search-results">
      <div className="filter-bar" role="group" aria-label="Filter search results">
        <label className="filter-field">
          <span>Type</span>
          <select
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as FileTypeKey | 'all' })}
          >
            <option value="all">All types</option>
            {FILE_TYPE_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>Modified</span>
          <select
            value={filters.modified}
            onChange={(e) => onFiltersChange({ ...filters, modified: e.target.value as DateRangeKey })}
          >
            {DATE_RANGE_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>Account</span>
          <select
            value={filters.accountId}
            onChange={(e) => onFiltersChange({ ...filters, accountId: e.target.value })}
          >
            <option value="all">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.email}</option>
            ))}
          </select>
        </label>
        <button type="button" className="filter-clear" onClick={clearFilters} disabled={filterCount === 0}>
          Clear filters
        </button>
        {filterCount > 0 && (
          <span className="filter-active" aria-live="polite">
            {filterCount} filter{filterCount !== 1 ? 's' : ''} on
          </span>
        )}
      </div>
      <div className="search-count" aria-live="polite">
        {filterCount > 0
          ? `${shown.length} of ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
          : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
        {capped &&
          ` · Showing the first ${PER_ACCOUNT_RESULT_LIMIT} matches per account. Type more of the name to narrow it down.`}
      </div>
      {shown.length === 0 ? (
        <div className="search-state">
          No results match these filters.{' '}
          <button type="button" className="filter-link" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
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
            {shown.map((r) => (
              <tr
                key={`${r.accountId}-${r.id}`}
                className="result-row"
                onClick={() => onSelectAccount(r.accountId)}
                title={`Go to ${r.accountName}'s Drive`}
              >
                <td className="col-name">
                  <span className="file-icon">{TYPE_ICONS[fileTypeOf(r)]}</span>
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
      )}
    </div>
  )
}
