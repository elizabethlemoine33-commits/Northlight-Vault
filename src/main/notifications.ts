import Store from 'electron-store'
import { app } from 'electron'
import { checkForUpdates } from './utils/updateChecker'

// The Northlight Vault feedback form (ClickUp Form → User Feedback list).
// Also linked from the About modal and the Help menu.
export const FEEDBACK_FORM_URL = 'https://forms.clickup.com/14151173/f/dfvg5-2317/FF757UNUCJJTY2UIBF'

// Public G2 review page for Northlight Vault. Asks every user the same way; never shown conditionally.
export const G2_REVIEW_URL = 'https://www.g2.com/products/northlight-vault/take_survey'

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
    // Version is read from the running app so the banner is never out of date
    message: `Welcome to Northlight Vault v${app.getVersion()}. Thanks for trying it. Feedback is appreciated.`,
    type: 'info'
  },
  {
    id: 'feedback-request-v1',
    message:
      "Help shape Vault. We're gathering early feedback to improve. We don't have it perfect yet. We want to hear what would make it better for you.",
    type: 'info',
    linkLabel: 'Share feedback',
    linkUrl: FEEDBACK_FORM_URL
  },
  {
    id: 'g2-review-v1',
    message: 'Using Vault? Tell other people what you think. An honest review on G2 helps.',
    type: 'info',
    linkLabel: 'Review on G2',
    linkUrl: G2_REVIEW_URL
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

// Checks GitHub once per launch. Returns a banner when a newer release exists and the user
// has not dismissed that version. Any failure (offline, rate limit) is silent: no banner.
export async function getUpdateNotification(): Promise<AppNotification | null> {
  try {
    const info = await checkForUpdates()
    if (!info.hasUpdate) return null
    const id = `update-${info.latestVersion}`
    if (store.get('dismissedNotifications').includes(id)) return null
    return {
      id,
      message: `Northlight Vault v${info.latestVersion} is available. You have v${info.currentVersion}.`,
      type: 'warning',
      linkLabel: 'Get the update',
      linkUrl: info.releaseUrl
    }
  } catch {
    return null
  }
}
