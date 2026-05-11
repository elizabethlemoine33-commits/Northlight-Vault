import { BrowserWindow, app } from 'electron'
import * as keytar from 'keytar'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import * as url from 'url'

const KEYTAR_SERVICE = 'cloud-file-browser'
const REDIRECT_PORT = 58342
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`

// consumers endpoint = personal Microsoft accounts (Outlook, Hotmail, Live)
const AUTHORITY = 'https://login.microsoftonline.com/consumers/oauth2/v2.0'

const SCOPES = [
  'https://graph.microsoft.com/Files.Read',
  'https://graph.microsoft.com/User.Read',
  'offline_access'
]

export interface MicrosoftAccount {
  id: string
  email: string
  displayName: string
  provider: 'onedrive'
}

interface StoredTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number // milliseconds since epoch
}

function loadClientId(): string {
  const credPath = app.isPackaged
    ? path.join(process.resourcesPath, 'azure-credentials.json')
    : path.join(process.cwd(), 'resources', 'azure-credentials.json')
  const raw = fs.readFileSync(credPath, 'utf-8')
  return JSON.parse(raw).clientId
}

// PKCE: generate a random verifier and its SHA-256 challenge
// This is how public clients prove the auth request is genuine without a secret
function generatePkce(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

function buildAuthUrl(clientId: string, challenge: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    response_mode: 'query',
    prompt: 'select_account'
  })
  return `${AUTHORITY}/authorize?${params}`
}

async function exchangeCode(clientId: string, code: string, verifier: string): Promise<StoredTokens> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
    scope: SCOPES.join(' ')
  })

  const res = await fetch(`${AUTHORITY}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Microsoft token exchange failed: ${text}`)
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  }
}

async function doRefresh(clientId: string, refreshToken: string): Promise<StoredTokens> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
    scope: SCOPES.join(' ')
  })

  const res = await fetch(`${AUTHORITY}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Microsoft token refresh failed: ${text}`)
  }

  const data = await res.json() as { access_token: string; refresh_token?: string; expires_in: number }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000
  }
}

async function fetchUserProfile(accessToken: string): Promise<{ id: string; displayName: string; mail: string | null; userPrincipalName: string }> {
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) throw new Error('Could not fetch Microsoft user profile.')
  return res.json() as Promise<{ id: string; displayName: string; mail: string | null; userPrincipalName: string }>
}

// Opens a Microsoft sign-in window and waits for the auth code redirect
function getAuthCodeViaWindow(authUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) return
      const parsed = url.parse(req.url, true)
      const code = parsed.query.code as string | undefined
      const error = parsed.query.error as string | undefined

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' })
        res.end(`<h2>Sign-in error: ${error}</h2>`)
        server.close()
        reject(new Error(`Microsoft sign-in error: ${error}`))
        return
      }

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<h2>Signed in successfully. You can close this window.</h2>')
        server.close()
        resolve(code)
      }
    })

    server.on('error', (err) => {
      reject(new Error(`Could not start auth server on port ${REDIRECT_PORT}: ${err.message}`))
    })

    server.listen(REDIRECT_PORT, '127.0.0.1', () => {
      const authWindow = new BrowserWindow({
        width: 500,
        height: 700,
        webPreferences: { nodeIntegration: false, contextIsolation: true }
      })
      authWindow.loadURL(authUrl)
      authWindow.on('closed', () => {
        server.close()
        reject(new Error('Sign-in window was closed before completing.'))
      })
    })
  })
}

export async function signInWithMicrosoft(): Promise<MicrosoftAccount> {
  const clientId = loadClientId()
  const { verifier, challenge } = generatePkce()

  const authUrl = buildAuthUrl(clientId, challenge)
  const code = await getAuthCodeViaWindow(authUrl)
  const tokens = await exchangeCode(clientId, code, verifier)

  const profile = await fetchUserProfile(tokens.accessToken)
  const accountId = profile.id

  await keytar.setPassword(KEYTAR_SERVICE, `onedrive-${accountId}`, JSON.stringify(tokens))

  return {
    id: accountId,
    email: profile.mail ?? profile.userPrincipalName,
    displayName: profile.displayName ?? profile.userPrincipalName,
    provider: 'onedrive'
  }
}

// Returns a valid access token, refreshing silently if the current one has expired
export async function getValidAccessToken(accountId: string): Promise<string> {
  const stored = await keytar.getPassword(KEYTAR_SERVICE, `onedrive-${accountId}`)
  if (!stored) throw new Error('OneDrive session expired. Please disconnect and sign in again.')

  const tokens: StoredTokens = JSON.parse(stored)

  // Return existing token if still valid (with 5-minute safety buffer)
  if (tokens.expiresAt > Date.now() + 5 * 60 * 1000) {
    return tokens.accessToken
  }

  // Access token expired — use the refresh token to get a new one silently
  const clientId = loadClientId()
  const newTokens = await doRefresh(clientId, tokens.refreshToken)
  await keytar.setPassword(KEYTAR_SERVICE, `onedrive-${accountId}`, JSON.stringify(newTokens))

  return newTokens.accessToken
}

export async function signOutMicrosoft(accountId: string): Promise<void> {
  await keytar.deletePassword(KEYTAR_SERVICE, `onedrive-${accountId}`)
}
