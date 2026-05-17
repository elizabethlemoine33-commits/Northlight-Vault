import * as Sentry from '@sentry/electron/renderer'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
