import { useEffect, useState } from 'react'
import './UpdateModal.css'

interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  releaseUrl: string
  releaseNotes: string
}

interface Props {
  onClose: () => void
}

export function UpdateModal({ onClose }: Props): JSX.Element {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [info, setInfo] = useState<UpdateInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    window.api.checkForUpdates()
      .then((result) => {
        setInfo(result as UpdateInfo)
        setStatus('done')
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : 'Could not reach GitHub. Check your internet connection.')
        setStatus('error')
      })
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Check for Updates</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          {status === 'loading' && (
            <p className="modal-status">Checking for updates…</p>
          )}

          {status === 'error' && (
            <>
              <p className="modal-status modal-error">Unable to check for updates.</p>
              <p className="modal-detail">{errorMsg}</p>
            </>
          )}

          {status === 'done' && info && info.hasUpdate && (
            <>
              <p className="modal-status modal-update-available">A new version is available!</p>
              <div className="version-row">
                <span className="version-label">Current</span>
                <span className="version-value">v{info.currentVersion}</span>
              </div>
              <div className="version-row">
                <span className="version-label">Latest</span>
                <span className="version-value version-new">v{info.latestVersion}</span>
              </div>
              {info.releaseNotes && (
                <div className="release-notes">
                  <div className="release-notes-label">Release notes</div>
                  <div className="release-notes-body">{info.releaseNotes.slice(0, 400)}{info.releaseNotes.length > 400 ? '…' : ''}</div>
                </div>
              )}
              <button
                className="modal-action-btn"
                onClick={() => window.api.openFile(info.releaseUrl)}
              >
                View Release on GitHub
              </button>
            </>
          )}

          {status === 'done' && info && !info.hasUpdate && (
            <>
              <p className="modal-status modal-up-to-date">You're on the latest version.</p>
              <div className="version-row">
                <span className="version-label">Version</span>
                <span className="version-value">v{info.currentVersion}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
