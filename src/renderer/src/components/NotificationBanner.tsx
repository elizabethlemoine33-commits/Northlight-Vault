import { useEffect, useState } from 'react'
import './NotificationBanner.css'

interface AppNotification {
  id: string
  message: string
  type: 'info' | 'warning'
}

export function NotificationBanner(): JSX.Element | null {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    window.api.getNotifications().then(setNotifications)
  }, [])

  async function handleDismiss(id: string) {
    await window.api.dismissNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="notification-stack">
      {notifications.map((n) => (
        <div key={n.id} className={`notification-banner notification-${n.type}`}>
          <span className="notification-message">{n.message}</span>
          <button
            className="notification-dismiss"
            onClick={() => handleDismiss(n.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
