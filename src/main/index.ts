import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { signInWithGoogle, signOutGoogle } from './auth/google'
import { getAccounts, addAccount, removeAccount } from './accounts'

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
    title: 'Cloud File Browser',
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

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
