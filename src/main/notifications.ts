import Store from 'electron-store'

// The Northlight Vault feedback form (ClickUp Form → User Feedback list).
// Also linked from the About modal and the Help menu.
export const FEEDBACK_FORM_URL = 'https://forms.clickup.com/14151173/f/dfvg5-2317/FF757UNUCJJTY2UIBF'

export interface AppNotification {
  id: string
  message: string
  type: 'info' | 'warning'
  // Optional action link shown after the message (opens in the system browser)
  linkLabel?: string
  linkUrl?: string
}

// Add new notifications here — id must be unique and stable (never reuse a retired id)
const ALL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'welcome-v1b',
    message: 'Welcome to Northlight Vault v1.0.0. Thanks for trying the early release — feedback is appreciated.',
    type: 'info'
  },
  {
    id: 'feedback-request-v1',
    message:
      "Help shape Vault. We're gathering early feedback to improve. We don't have it perfect yet. We want to hear what would make it better for you.",
    type: 'info',
    linkLabel: 'Share feedback',
    linkUrl: FEEDBACK_FORM_URL
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
