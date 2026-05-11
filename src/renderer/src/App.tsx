import { useEffect, useRef, useState } from 'react'
import './App.css'
import { FileList } from './components/FileList'
import { SearchResults } from './components/SearchResults'

interface GoogleAccount {
  id: string
  email: string
  displayName: string
  provider: 'google'
}

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

declare global {
  interface Window {
    api: {
      getAccounts: () => Promise<GoogleAccount[]>
      connectAccount: () => Promise<GoogleAccount>
      disconnectAccount: (accountId: string) => Promise<void>
      listFiles: (accountId: string, folderId: string) => Promise<unknown[]>
      searchFiles: (query: string) => Promise<SearchResult[]>
      openFile: (url: string) => Promise<void>
    }
  }
}

function App(): JSX.Element {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isSearching = searchQuery.trim().length > 0

  useEffect(() => {
    window.api.getAccounts().then((saved) => {
      setAccounts(saved)
      if (saved.length > 0) setActiveAccountId(saved[0].id)
    })
  }, [])

  // Debounced search: wait 350ms after the user stops typing before firing
  // This avoids hammering the API on every keystroke
  function handleSearchInput(value: string) {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await window.api.searchFiles(value)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 350)
  }

  function handleSearchSelectAccount(accountId: string) {
    setActiveAccountId(accountId)
    setSearchQuery('')
    setSearchResults([])
  }

  async function handleConnect() {
    setConnecting(true)
    setError(null)
    try {
      const account = await window.api.connectAccount()
      setAccounts((prev) => {
        const exists = prev.find((a) => a.id === account.id)
        return exists ? prev.map((a) => (a.id === account.id ? account : a)) : [...prev, account]
      })
      setActiveAccountId(account.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect(accountId: string) {
    await window.api.disconnectAccount(accountId)
    setAccounts((prev) => prev.filter((a) => a.id !== accountId))
    setActiveAccountId((prev) => {
      if (prev !== accountId) return prev
      const remaining = accounts.filter((a) => a.id !== accountId)
      return remaining.length > 0 ? remaining[0].id : null
    })
  }

  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null

  return (
    <div className="app">
      <header className="sidebar">
        <div className="sidebar-title">Cloud File Browser</div>

        <div className="account-list">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`account-tab ${account.id === activeAccountId && !isSearching ? 'active' : ''}`}
              onClick={() => { setSearchQuery(''); setActiveAccountId(account.id) }}
            >
              <div className="account-avatar">{account.displayName[0].toUpperCase()}</div>
              <div className="account-info">
                <div className="account-name">{account.displayName}</div>
                <div className="account-email">{account.email}</div>
              </div>
              <button
                className="disconnect-btn"
                onClick={(e) => { e.stopPropagation(); handleDisconnect(account.id) }}
                title="Disconnect account"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button className="connect-btn" onClick={handleConnect} disabled={connecting}>
          {connecting ? 'Signing in…' : '+ Connect Google Drive'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </header>

      <main className="content">
        {/* Search bar — always visible at the top when accounts are connected */}
        {accounts.length > 0 && (
          <div className="search-bar-container">
            <input
              className="search-bar"
              type="text"
              placeholder="Search all accounts…"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => handleSearchInput('')}>×</button>
            )}
          </div>
        )}

        {/* Main panel: search results OR file browser */}
        <div className="main-panel">
          {isSearching ? (
            <SearchResults
              results={searchResults}
              loading={searchLoading}
              query={searchQuery}
              onSelectAccount={handleSearchSelectAccount}
            />
          ) : activeAccount ? (
            <FileList
              accountId={activeAccount.id}
              accountName={activeAccount.displayName}
            />
          ) : (
            <div className="placeholder">
              <h2>No accounts connected</h2>
              <p>Click "Connect Google Drive" to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
