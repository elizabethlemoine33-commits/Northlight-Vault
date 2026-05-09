import Store from 'electron-store'
import { GoogleAccount } from './auth/google'

// electron-store saves a JSON file on disk with the account list
// It does NOT store tokens — tokens live in keytar (Windows Credential Store)
const store = new Store<{ accounts: GoogleAccount[] }>({
  defaults: { accounts: [] }
})

export function getAccounts(): GoogleAccount[] {
  return store.get('accounts')
}

export function addAccount(account: GoogleAccount): void {
  const accounts = getAccounts()
  // Prevent duplicates — if this account is already connected, update it
  const existing = accounts.findIndex((a) => a.id === account.id)
  if (existing >= 0) {
    accounts[existing] = account
  } else {
    accounts.push(account)
  }
  store.set('accounts', accounts)
}

export function removeAccount(accountId: string): void {
  const accounts = getAccounts().filter((a) => a.id !== accountId)
  store.set('accounts', accounts)
}
