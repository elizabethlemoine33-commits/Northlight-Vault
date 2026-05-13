import { BrowserWindow, app, net } from 'electron'
import * as keytar from 'keytar'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import * as crypto from 'crypto'

const KEYTAR_SERVICE = 'northlight-vault'
const REDIRECT_PORT = 45678
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/auth/dropbox/callback`

function loadCredentials(): { appKey: string; appSecret: string } {
  const credPath = app.isPackaged
    ? path.join(process.resourcesPath, 'dropbox-credentials.json')
    : path.join(process.cwd(), 'resources', 'dropbox-credentials.json')
  const raw = fs.readFileSync(credPath, 'utf-8')
  const parsed = JSON.parse(raw)
  return { appKey: parsed.app_key, appSecret: parsed.app_secret }
}

function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}

async function getAuthCodeViaWindow(appKey: string, codeChallenge: string): Promise<string> {
  const authUrl =
    `https://www.dropbox.com/oauth2/authorize` +
    `?client_id=${appKey}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&token_access_type=offline` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256`

  return new Promise((resolve, reject) => {
    let authWindow: BrowserWindow | null = null

    const server = http.createServer((req, res) => {
      if (!req.url) return
      const urlObj = new URL(req.url, `http://localhost:${REDIRECT_PORT}`)
      const code = urlObj.searchParams.get('code')
      const error = urlObj.searchParams.get('error')

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<h2 style="font-family:sans-serif;margin:40px auto;max-width:400px">Dropbox connected successfully. You can close this window.</h2>')
        server.close()
        if (authWindow && !authWindow.isDestroyed()) authWindow.close()
        resolve(code)
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' })
        res.end('<h2 style="font-family:sans-serif;margin:40px auto;max-width:400px">Sign-in error. Please try again.</h2>')
        server.close()
        reject(new Error(error ?? 'No auth code received from Dropbox'))
      }
    })

    server.listen(REDIRECT_PORT, '127.0.0.1', () => {
      authWindow = new BrowserWindow({
        width: 500,
        height: 700,
        webPreferences: { nodeIntegration: false, contextIsolation: true }
      })

      authWindow.loadURL(authUrl)

      authWindow.on('closed', () => {
        server.close()
        reject(new Error('Sign-in window closed before completing.'))
      })
    })

    server.on('error', (err) => reject(err))
  })
}

async function exchangeCodeForTokens(
  appKey: string,
  code: string,
  codeVerifier: string
): Promise<{ accessToken: string; refreshToken: string; accountId: string }> {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: appKey,
      code_verifier: codeVerifier
    }).toString()

    const request = net.request({
      method: 'POST',
      url: 'https://api.dropboxapi.com/oauth2/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    let responseBody = ''
    request.on('response', (response) => {
      response.on('data', (chunk) => { responseBody += chunk.toString() })
      response.on('end', () => {
        try {
          const data = JSON.parse(responseBody)
          if (data.error) {
            reject(new Error(`Dropbox token error: ${data.error_description ?? data.error}`))
            return
          }
          resolve({
            accessToken: data.access_token as string,
            refreshToken: data.refresh_token as string,
            accountId: data.account_id as string
          })
        } catch {
          reject(new Error('Failed to parse Dropbox token response'))
        }
      })
    })
    request.on('error', reject)
    request.write(body)
    request.end()
  })
}

async function fetchAccountInfo(accessToken: string): Promise<{ email: string; displayName: string }> {
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: 'POST',
      url: 'https://api.dropboxapi.com/2/users/get_current_account',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    let body = ''
    request.on('response', (response) => {
      response.on('data', (chunk) => { body += chunk.toString() })
      response.on('end', () => {
        try {
          const data = JSON.parse(body)
          resolve({
            email: data.email ?? '',
            displayName: data.name?.display_name ?? data.email ?? 'Dropbox'
          })
        } catch {
          reject(new Error('Failed to parse Dropbox account info'))
        }
      })
    })
    request.on('error', reject)
    request.end()
  })
}

export interface DropboxAccount {
  id: string
  email: string
  displayName: string
  provider: 'dropbox'
}

export async function signInWithDropbox(): Promise<DropboxAccount> {
  const { appKey } = loadCredentials()
  const { codeVerifier, codeChallenge } = generatePKCE()

  const code = await getAuthCodeViaWindow(appKey, codeChallenge)
  const { accessToken, refreshToken, accountId } = await exchangeCodeForTokens(appKey, code, codeVerifier)
  const { email, displayName } = await fetchAccountInfo(accessToken)

  await keytar.setPassword(
    KEYTAR_SERVICE,
    `dropbox-${accountId}`,
    JSON.stringify({ accessToken, refreshToken })
  )

  return { id: accountId, email, displayName, provider: 'dropbox' }
}

export async function getDropboxAccessToken(accountId: string): Promise<string> {
  const { appKey, appSecret } = loadCredentials()
  const stored = await keytar.getPassword(KEYTAR_SERVICE, `dropbox-${accountId}`)
  if (!stored) throw new Error(`No Dropbox credentials for account ${accountId}`)

  const { accessToken, refreshToken } = JSON.parse(stored) as {
    accessToken: string
    refreshToken: string
  }

  // Only refresh if we don't have an access token (shouldn't happen, but defensive)
  if (accessToken) return Promise.resolve(accessToken)

  return new Promise((resolve) => {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: appKey,
      client_secret: appSecret
    }).toString()

    const request = net.request({
      method: 'POST',
      url: 'https://api.dropboxapi.com/oauth2/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    let responseBody = ''
    request.on('response', (response) => {
      response.on('data', (chunk) => { responseBody += chunk.toString() })
      response.on('end', async () => {
        try {
          const data = JSON.parse(responseBody)
          if (data.error || !data.access_token) {
            resolve(accessToken)
            return
          }
          const newAccessToken = data.access_token as string
          await keytar.setPassword(
            KEYTAR_SERVICE,
            `dropbox-${accountId}`,
            JSON.stringify({ accessToken: newAccessToken, refreshToken })
          )
          resolve(newAccessToken)
        } catch {
          resolve(accessToken)
        }
      })
    })
    request.on('error', () => resolve(accessToken))
    request.write(body)
    request.end()
  })
}

export async function signOutDropbox(accountId: string): Promise<void> {
  await keytar.deletePassword(KEYTAR_SERVICE, `dropbox-${accountId}`)
}
