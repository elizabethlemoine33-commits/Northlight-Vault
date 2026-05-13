import Store from 'electron-store'
import type { GoogleAccount } from './auth/google'
import type { MicrosoftAccount } from './auth/microsoft'
import type { DropboxAccount } from './auth/dropbox'

export type Account = GoogleAccount | MicrosoftAccount | DropboxAccount

const store = new Store<{ accounts: Account[] }>({
  defaults: { accounts: [] }
})

export function getAccounts(): Account[] {
  return store.get('accounts')
}

export function addAccount(account: Account): void {
  const accounts = getAccounts()
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
