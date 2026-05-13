import { app } from 'electron'
import { net } from 'electron'

const REPO = 'elizabethlemoine33-commits/Northlight-Vault'
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases/latest`

export interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  releaseUrl: string
  releaseNotes: string
}

function isVersionNewer(latest: string, current: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number)
  const [lMaj, lMin, lPat] = parse(latest)
  const [cMaj, cMin, cPat] = parse(current)
  if (lMaj !== cMaj) return lMaj > cMaj
  if (lMin !== cMin) return lMin > cMin
  return lPat > cPat
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const currentVersion = app.getVersion()

  return new Promise((resolve, reject) => {
    const request = net.request({
      method: 'GET',
      url: RELEASES_URL,
      headers: {
        'User-Agent': 'Northlight-Vault-App',
        'Accept': 'application/vnd.github+json'
      }
    })

    let body = ''

    request.on('response', (response) => {
      response.on('data', (chunk) => { body += chunk.toString() })
      response.on('end', () => {
        if (response.statusCode === 404) {
          resolve({
            hasUpdate: false,
            currentVersion,
            latestVersion: currentVersion,
            releaseUrl: `https://github.com/${REPO}/releases`,
            releaseNotes: ''
          })
          return
        }
        if (response.statusCode !== 200) {
          reject(new Error(`GitHub API returned status ${response.statusCode}`))
          return
        }
        try {
          const data = JSON.parse(body)
          const latestVersion = (data.tag_name as string).replace(/^v/, '')
          resolve({
            hasUpdate: isVersionNewer(latestVersion, currentVersion),
            currentVersion,
            latestVersion,
            releaseUrl: data.html_url as string,
            releaseNotes: (data.body as string) ?? ''
          })
        } catch {
          reject(new Error('Failed to parse GitHub release data'))
        }
      })
    })

    request.on('error', (err) => reject(err))
    request.end()
  })
}
