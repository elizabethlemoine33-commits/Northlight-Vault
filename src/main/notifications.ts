import Store from 'electron-store'

export interface AppNotification {
  id: string
  message: string
  type: 'info' | 'warning'
}

// Add new notifications here — id must be unique and stable (never reuse a retired id)
const ALL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'welcome-v1b',
    message: 'Welcome to Northlight Vault v1.0.0. Thanks for trying the early release — feedback is appreciated.',
    type: 'info'
  }
]

const store = new Store<{ dismissedNotifications: string[] }>({
  defaults: { dismissedNotifications: [] }
})

export function getActiveNotifications(): AppNotification[] {
  const dismissed = store.get('dismissedNotifications')
  return ALL_NOTIFICATIONS.filter((n) => !dismissed.includes(n.id))
}

export function dismissNotification(id: string): void {
  const dismissed = store.get('dismissedNotifications')
  if (!dismissed.includes(id)) {
    store.set('dismissedNotifications', [...dismissed, id])
  }
}
