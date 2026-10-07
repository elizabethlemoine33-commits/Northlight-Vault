import { useEffect, useRef, useState } from 'react'
import './App.css'
import wordmark from './assets/northlight-vault-browser.png'
import { FileList } from './components/FileList'
import { SearchResults } from './components/SearchResults'
import { UpdateModal } from './components/UpdateModal'
import { AboutModal } from './components/AboutModal'
import { NotificationBanner } from './components/NotificationBanner'

interface Account {
  id: string
  email: string
  displayName: string
  provider: 'google' | 'onedrive' | 'dropbox'
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
      getAccounts: () => Promise<Account[]>
      connectAccount: () => Promise<Account>
      disconnectAccount: (accountId: string) => Promise<void>
      connectOneDrive: () => Promise<Account>
      disconnectOneDrive: (accountId: string) => Promise<void>
      connectDropbox: () => Promise<Account>
      disconnectDropbox: (accountId: string) => Promise<void>
      listFiles: (accountId: string, folderId: string) => Promise<unknown[]>
      searchFiles: (query: string) => Promise<SearchResult[]>
      openFile: (url: string) => Promise<void>
      checkForUpdates: () => Promise<unknown>
      getVersion: () => Promise<string>
      onMenuCheckForUpdates: (callback: () => void) => () => void
      onMenuShowAbout: (callback: () => void) => () => void
      getNotifications: () => Promise<
        { id: string; message: string; type: 'info' | 'warning'; linkLabel?: string; linkUrl?: string }[]
      >
      dismissNotification: (id: string) => Promise<void>
    }
  }
}

function App(): JSX.Element {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [connectingGoogle, setConnectingGoogle] = useState(false)
  const [connectingOneDrive, setConnectingOneDrive] = useState(false)
  const [connectingDropbox, setConnectingDropbox] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)

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

  useEffect(() => {
    const remove = window.api.onMenuCheckForUpdates(() => setShowUpdateModal(true))
    return remove
  }, [])

  useEffect(() => {
    const remove = window.api.onMenuShowAbout(() => setShowAboutModal(true))
    return remove
  }, [])

  // Debounced search: wait 350ms after the user stops typing before firing
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

  async function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    if (isSearching) {
      try {
        const results = await window.api.searchFiles(searchQuery)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      }
    } else {
      setRefreshKey((k) => k + 1)
    }
    setTimeout(() => setRefreshing(false), 600)
  }

  function handleSearchSelectAccount(accountId: string) {
    setActiveAccountId(accountId)
    setSearchQuery('')
    setSearchResults([])
  }

  async function handleConnectGoogle() {
    setConnectingGoogle(true)
    setError(null)
    try {
      const account = await window.api.connectAccount()
      setAccounts((prev) => {
        const exists = prev.find((a) => a.id === account.id)
        return exists ? prev.map((a) => (a.id === account.id ? account : a)) : [...prev, account]
      })
      setActiveAccountId(account.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.')
    } finally {
      setConnectingGoogle(false)
    }
  }

  async function handleConnectOneDrive() {
    setConnectingOneDrive(true)
    setError(null)
    try {
      const account = await window.api.connectOneDrive()
      setAccounts((prev) => {
        const exists = prev.find((a) => a.id === account.id)
        return exists ? prev.map((a) => (a.id === account.id ? account : a)) : [...prev, account]
      })
      setActiveAccountId(account.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OneDrive sign-in failed. Please try again.')
    } finally {
      setConnectingOneDrive(false)
    }
  }

  async function handleConnectDropbox() {
    setConnectingDropbox(true)
    setError(null)
    try {
      const account = await window.api.connectDropbox()
      setAccounts((prev) => {
        const exists = prev.find((a) => a.id === account.id)
        return exists ? prev.map((a) => (a.id === account.id ? account : a)) : [...prev, account]
      })
      setActiveAccountId(account.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Dropbox sign-in failed. Please try again.')
    } finally {
      setConnectingDropbox(false)
    }
  }

  async function handleDisconnect(account: Account) {
    if (account.provider === 'onedrive') {
      await window.api.disconnectOneDrive(account.id)
    } else if (account.provider === 'dropbox') {
      await window.api.disconnectDropbox(account.id)
    } else {
      await window.api.disconnectAccount(account.id)
    }
    setAccounts((prev) => prev.filter((a) => a.id !== account.id))
    setActiveAccountId((prev) => {
      if (prev !== account.id) return prev
      const remaining = accounts.filter((a) => a.id !== account.id)
      return remaining.length > 0 ? remaining[0].id : null
    })
  }

  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null

  return (
    <div className="app">
      {showUpdateModal && <UpdateModal onClose={() => setShowUpdateModal(false)} />}
      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
      <header className="sidebar">
        <div className="sidebar-gradient-bar" />
        <div className="sidebar-inner">
        <div className="sidebar-brand">
          <img
            src={wordmark}
            alt="Northlight Vault"
            className="sidebar-wordmark"
          />
        </div>

        <div className="account-list">
          {(['google', 'onedrive', 'dropbox'] as const).map((provider) => {
            const group = accounts.filter((a) => a.provider === provider)
            if (group.length === 0) return null
            const label = provider === 'google' ? 'Google Drive' : provider === 'onedrive' ? 'OneDrive' : 'Dropbox'
            return (
              <div key={provider} className="account-group">
                <div className="account-group-label">{label}</div>
                {group.map((account) => (
                  <div
                    key={account.id}
                    className={`account-tab ${account.id === activeAccountId && !isSearching ? 'active' : ''}`}
                    onClick={() => { setSearchQuery(''); setActiveAccountId(account.id) }}
                  >
                    <div className={`account-avatar avatar-${provider}`}>
                      {account.displayName[0].toUpperCase()}
                    </div>
                    <div className="account-info">
                      <div className="account-name">{account.displayName}</div>
                      <div className="account-email">{account.email}</div>
                    </div>
                    <button
                      className="disconnect-btn"
                      onClick={(e) => { e.stopPropagation(); handleDisconnect(account) }}
                      title="Disconnect account"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        <div className="connect-buttons">
          <button className="connect-btn" onClick={handleConnectGoogle} disabled={connectingGoogle}>
            {connectingGoogle ? 'Signing in…' : '+ Connect Google Drive'}
          </button>
          <button className="connect-btn connect-btn-onedrive" onClick={handleConnectOneDrive} disabled={connectingOneDrive}>
            {connectingOneDrive ? 'Signing in…' : '+ Connect OneDrive'}
          </button>
          <button className="connect-btn connect-btn-dropbox" onClick={handleConnectDropbox} disabled={connectingDropbox}>
            {connectingDropbox ? 'Signing in…' : '+ Connect Dropbox'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        </div>
      </header>

      <main className="content">
        <NotificationBanner />
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
            <button
              className={`refresh-btn${refreshing ? ' refreshing' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh file list"
              aria-label="Refresh file list"
            >
              ↻
            </button>
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
              refreshKey={refreshKey}
            />
          ) : (
            <div className="placeholder">
              <h2>No accounts connected</h2>
              <p>Click "Connect Google Drive" or "Connect OneDrive" to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
