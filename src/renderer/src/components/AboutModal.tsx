import { useEffect, useState } from 'react'
import './AboutModal.css'

interface Props {
  onClose: () => void
}

export function AboutModal({ onClose }: Props): JSX.Element {
  const [version, setVersion] = useState<string>('…')

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  function openLink(url: string) {
    window.api.openFile(url)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box about-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">About Northlight Vault</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body about-body">
          <div className="about-identity">
            <div className="about-app-name">Northlight Vault</div>
            <div className="about-descriptor">Cloud File Browser</div>
            <div className="about-version">Version {version}</div>
          </div>

          <p className="about-description">
            Northlight Vault is a desktop app that brings your cloud storage together in one place.
            Browse, search, and open files across Google Drive, Microsoft OneDrive, and Dropbox —
            without switching between apps or browser tabs.
          </p>

          <p className="about-built-by">Built by Northlight.</p>

          <div className="about-links">
            <div className="about-link-row">
              <span className="about-link-label">Developer</span>
              <button className="about-link" onClick={() => openLink('https://bynorthlight.ca')}>
                bynorthlight.ca
              </button>
            </div>
            <div className="about-link-row">
              <span className="about-link-label">Support</span>
              <button className="about-link" onClick={() => openLink('mailto:support@bynorthlight.ca')}>
                support@bynorthlight.ca
              </button>
            </div>
            <div className="about-link-row">
              <span className="about-link-label">Feedback</span>
              <button className="about-link" onClick={() => openLink('https://forms.clickup.com/14151173/f/dfvg5-2317/FF757UNUCJJTY2UIBF')}>
                Submit feedback
              </button>
            </div>
            <div className="about-link-row">
              <span className="about-link-label">Privacy Policy</span>
              <button className="about-link" onClick={() => openLink('https://bynorthlight.ca/vault-privacy.html')}>
                bynorthlight.ca/vault-privacy.html
              </button>
            </div>
          </div>

          <div className="about-copyright">© 2026 Northlight. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}
