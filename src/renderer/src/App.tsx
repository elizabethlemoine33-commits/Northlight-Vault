import { useEffect, useState } from 'react'
import './App.css'
import { FileList } from './components/FileList'

interface GoogleAccount {
  id: string
  email: string
  displayName: string
  provider: 'google'
}

// Tell TypeScript that window.api exists (it's injected by the preload script)
declare global {
  interface Window {
    api: {
      getAccounts: () => Promise<GoogleAccount[]>
      connectAccount: () => Promise<GoogleAccount>
      disconnectAccount: (accountId: string) => Promise<void>
      listFiles: (accountId: string, folderId: string) => Promise<unknown[]>
    }
  }
}

function App(): JSX.Element {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved accounts when the app starts
  useEffect(() => {
    window.api.getAccounts().then((saved) => {
      setAccounts(saved)
      if (saved.length > 0) setActiveAccountId(saved[0].id)
    })
  }, [])

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
              className={`account-tab ${account.id === activeAccountId ? 'active' : ''}`}
              onClick={() => setActiveAccountId(account.id)}
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
        {activeAccount ? (
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
      </main>
    </div>
  )
}

export default App
