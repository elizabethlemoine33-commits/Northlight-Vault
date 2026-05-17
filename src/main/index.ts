import * as Sentry from '@sentry/electron/main'

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0
})

import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { signInWithGoogle, signOutGoogle } from './auth/google'
import { signInWithMicrosoft, signOutMicrosoft } from './auth/microsoft'
import { signInWithDropbox, signOutDropbox } from './auth/dropbox'
import { getAccounts, addAccount, removeAccount } from './accounts'
import { listFiles as listGoogleFiles } from './drive/google'
import { listFiles as listOneDriveFiles } from './drive/onedrive'
import { listFiles as listDropboxFiles } from './drive/dropbox'
import { searchAllAccounts } from './search'
import { checkForUpdates } from './utils/updateChecker'
import { getActiveNotifications, dismissNotification } from './notifications'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // Security: preload script is the only bridge between frontend and backend
      preload: join(__dirname, '../preload/index.js'),
      // Security: renderer cannot access Node.js APIs directly
      nodeIntegration: false,
      // Security: renderer runs in its own isolated context
      contextIsolation: true,
      // Security: disable ability to run local files
      webSecurity: true
    },
    title: 'Northlight Vault',
    icon: app.isPackaged ? undefined : join(process.cwd(), 'resources', 'icon.png'),
    show: false
  })

  // Show window only once it's fully loaded (prevents white flash on startup)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in the system browser, not inside the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Load the renderer (React app)
  if (process.env['ELECTRON_RENDERER_URL']) {
    // Development: load from Vite dev server
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // Production: load from built files
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// IPC handlers — these are the backend functions the frontend can call via the preload bridge
// IPC stands for "Inter-Process Communication" — the message system between main and renderer

ipcMain.handle('accounts:get', () => getAccounts())

ipcMain.handle('accounts:connect', async () => {
  const account = await signInWithGoogle()
  addAccount(account)
  return account
})

ipcMain.handle('accounts:disconnect', async (_event, accountId: string) => {
  await signOutGoogle(accountId)
  removeAccount(accountId)
})

ipcMain.handle('accounts:connect-onedrive', async () => {
  const account = await signInWithMicrosoft()
  addAccount(account)
  return account
})

ipcMain.handle('accounts:disconnect-onedrive', async (_event, accountId: string) => {
  await signOutMicrosoft(accountId)
  removeAccount(accountId)
})

ipcMain.handle('accounts:connect-dropbox', async () => {
  const account = await signInWithDropbox()
  addAccount(account)
  return account
})

ipcMain.handle('accounts:disconnect-dropbox', async (_event, accountId: string) => {
  await signOutDropbox(accountId)
  removeAccount(accountId)
})

ipcMain.handle('drive:listFiles', async (_event, accountId: string, folderId: string) => {
  const account = getAccounts().find((a) => a.id === accountId)
  if (!account) throw new Error(`Account not found: ${accountId}`)
  if (account.provider === 'onedrive') return listOneDriveFiles(accountId, folderId)
  if (account.provider === 'dropbox') return listDropboxFiles(accountId, folderId)
  return listGoogleFiles(accountId, folderId)
})

ipcMain.handle('search:query', async (_event, query: string) => {
  console.log('[search] query:', query)
  const results = await searchAllAccounts(query)
  console.log('[search] results count:', results.length)
  return results
})

ipcMain.handle('app:checkForUpdates', async () => {
  return checkForUpdates()
})

ipcMain.handle('app:getVersion', () => app.getVersion())

ipcMain.handle('notifications:get', () => getActiveNotifications())

ipcMain.handle('notifications:dismiss', (_event, id: string) => dismissNotification(id))

ipcMain.handle('file:open', async (_event, url: string) => {
  // Only open https:// URLs or mailto: links — never file paths or other protocols
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('mailto:'))) {
    await shell.openExternal(url)
  }
})

function buildAppMenu(): void {
  const changelogPath = app.isPackaged
    ? join(process.resourcesPath, 'CHANGELOG.md')
    : join(process.cwd(), 'CHANGELOG.md')

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Help',
      submenu: [
        {
          label: 'View Changelog',
          click: () => shell.openPath(changelogPath)
        },
        {
          label: 'Check for Updates…',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) win.webContents.send('menu:check-for-updates')
          }
        },
        {
          label: 'About Northlight Vault…',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) win.webContents.send('menu:show-about')
          }
        },
        { type: 'separator' },
        {
          label: `Northlight Vault v${app.getVersion()}`,
          enabled: false
        }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  buildAppMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
