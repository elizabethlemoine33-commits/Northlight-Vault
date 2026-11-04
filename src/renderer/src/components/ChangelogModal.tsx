import { useEffect, useState } from 'react'
import './UpdateModal.css'
import './ChangelogModal.css'
import { parseChangelog, sectionKind, type ChangelogVersion, type Piece } from '../lib/changelog'

interface Props {
  onClose: () => void
}

function Inline({ pieces }: { pieces: Piece[] }): JSX.Element {
  return (
    <>
      {pieces.map((p, i) => {
        if (p.kind === 'bold') return <strong key={i}>{p.text}</strong>
        if (p.kind === 'code') return <code key={i}>{p.text}</code>
        if (p.kind === 'link') {
          return (
            <button key={i} type="button" className="changelog-link" onClick={() => window.api.openFile(p.url)}>
              {p.text}
            </button>
          )
        }
        return <span key={i}>{p.text}</span>
      })}
    </>
  )
}

export function ChangelogModal({ onClose }: Props): JSX.Element {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [versions, setVersions] = useState<ChangelogVersion[]>([])
  const [current, setCurrent] = useState('')

  useEffect(() => {
    Promise.all([window.api.getChangelog(), window.api.getVersion()])
      .then(([markdown, version]) => {
        setVersions(parseChangelog(markdown))
        setCurrent(version)
        setStatus('done')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box changelog-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title" id="changelog-title">What's new in Northlight Vault</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="changelog-scroll">
          {status === 'loading' && <p className="modal-status">Loading…</p>}

          {status === 'error' && (
            <p className="modal-status modal-error">Could not load the list of changes.</p>
          )}

          {status === 'done' && versions.length === 0 && (
            <p className="modal-status">Nothing to show yet.</p>
          )}

          {status === 'done' &&
            versions.map((v) => (
              <section key={v.version} className="changelog-version">
                <h2 className="changelog-version-head">
                  <span className="changelog-version-num">Version {v.version}</span>
                  {v.version === current && <span className="changelog-current">You have this</span>}
                  {v.date && <span className="changelog-date">{v.date}</span>}
                </h2>
                {v.sections.map((s, si) => (
                  <div key={si} className="changelog-section">
                    {s.title && (
                      <h3 className={`changelog-label changelog-label-${sectionKind(s.title)}`}>{s.title}</h3>
                    )}
                    <ul className="changelog-list">
                      {s.items.map((item, ii) => (
                        <li key={ii}>
                          <Inline pieces={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))}
        </div>
      </div>
    </div>
  )
}
