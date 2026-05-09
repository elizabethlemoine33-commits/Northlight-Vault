import { BrowserWindow } from 'electron'
import { google } from 'googleapis'
import * as keytar from 'keytar'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import * as url from 'url'

const KEYTAR_SERVICE = 'cloud-file-browser'

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

function loadCredentials(): { client_id: string; client_secret: string } {
  const credPath = path.join(process.cwd(), 'resources', 'google-credentials.json')
  const raw = fs.readFileSync(credPath, 'utf-8')
  const parsed = JSON.parse(raw)
  const creds = parsed.installed || parsed.web
  return { client_id: creds.client_id, client_secret: creds.client_secret }
}

// Opens a Google sign-in window and returns the auth code + the port used,
// so the token exchange step can use the exact same redirect URI.
async function getAuthCodeViaWindow(): Promise<{ code: string; port: number }> {
  const { client_id, client_secret } = loadCredentials()

  return new Promise((resolve, reject) => {
    // Create a local server that will catch Google's redirect after sign-in
    const server = http.createServer((req, res) => {
      if (!req.url) return
      const parsed = url.parse(req.url, true)
      const code = parsed.query.code as string | undefined
      const addr = server.address() as { port: number }

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<h2>Signed in successfully. You can close this window.</h2>')
        server.close()
        resolve({ code, port: addr.port })
      } else {
        res.writeHead(400)
        res.end('Sign-in error — no code received.')
        server.close()
        reject(new Error('No auth code in redirect'))
      }
    })

    // Listen on port 0 = OS picks any available port automatically
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number }
      const redirectUri = `http://localhost:${addr.port}`

      // Create the OAuth client using the actual port we got
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri)

      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline', // gets us a refresh token for silent re-auth later
        scope: SCOPES,
        prompt: 'select_account'
      })

      // Open the Google sign-in page in a small Electron window
      const authWindow = new BrowserWindow({
        width: 500,
        height: 650,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      authWindow.loadURL(authUrl)

      authWindow.on('closed', () => {
        server.close()
        reject(new Error('Sign-in window was closed before completing.'))
      })
    })
  })
}

export interface GoogleAccount {
  id: string
  email: string
  displayName: string
  provider: 'google'
}

export async function signInWithGoogle(): Promise<GoogleAccount> {
  const { client_id, client_secret } = loadCredentials()

  // Step 1: open browser window, get auth code back
  const { code, port } = await getAuthCodeViaWindow()

  // Step 2: exchange the auth code for tokens
  // Must use the same redirect URI that was used to generate the auth URL
  const redirectUri = `http://localhost:${port}`
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri)
  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens)

  // Step 3: fetch the user's Google profile (name + email)
  const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client })
  const { data: profile } = await oauth2.userinfo.get()

  if (!profile.id || !profile.email) {
    throw new Error('Could not retrieve Google account info after sign-in.')
  }

  // Step 4: store tokens securely in Windows Credential Store
  // Key is per-account so multiple accounts coexist without overwriting each other
  await keytar.setPassword(KEYTAR_SERVICE, `google-${profile.id}`, JSON.stringify(tokens))

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.name || profile.email,
    provider: 'google'
  }
}

// Returns an authenticated Google API client for a saved account.
// Handles token refresh automatically if the access token has expired.
export async function getAuthenticatedClient(accountId: string) {
  const tokenJson = await keytar.getPassword(KEYTAR_SERVICE, `google-${accountId}`)
  if (!tokenJson) throw new Error(`No stored credentials for account ${accountId}`)

  const { client_id, client_secret } = loadCredentials()
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret)
  oAuth2Client.setCredentials(JSON.parse(tokenJson))

  // When a new access token is issued automatically, save the updated tokens
  oAuth2Client.on('tokens', async (newTokens) => {
    const existing = JSON.parse(
      (await keytar.getPassword(KEYTAR_SERVICE, `google-${accountId}`)) || '{}'
    )
    await keytar.setPassword(
      KEYTAR_SERVICE,
      `google-${accountId}`,
      JSON.stringify({ ...existing, ...newTokens })
    )
  })

  return oAuth2Client
}

export async function signOutGoogle(accountId: string): Promise<void> {
  await keytar.deletePassword(KEYTAR_SERVICE, `google-${accountId}`)
}
