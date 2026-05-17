import { contextBridge, ipcRenderer } from 'electron'

// Everything listed here is callable from the React frontend.
// Nothing else from Node.js or Electron is accessible to the renderer.
contextBridge.exposeInMainWorld('api', {
  // Returns the list of all connected accounts (Google and OneDrive)
  getAccounts: () => ipcRenderer.invoke('accounts:get'),

  // Opens Google sign-in browser window; returns the new account on success
  connectAccount: () => ipcRenderer.invoke('accounts:connect'),

  // Removes a Google account's tokens and clears it from the list
  disconnectAccount: (accountId: string) => ipcRenderer.invoke('accounts:disconnect', accountId),

  // Opens Microsoft sign-in browser window; returns the new OneDrive account on success
  connectOneDrive: () => ipcRenderer.invoke('accounts:connect-onedrive'),

  // Removes a OneDrive account's tokens and clears it from the list
  disconnectOneDrive: (accountId: string) => ipcRenderer.invoke('accounts:disconnect-onedrive', accountId),

  // Opens Dropbox sign-in browser window; returns the new Dropbox account on success
  connectDropbox: () => ipcRenderer.invoke('accounts:connect-dropbox'),

  // Removes a Dropbox account's tokens and clears it from the list
  disconnectDropbox: (accountId: string) => ipcRenderer.invoke('accounts:disconnect-dropbox', accountId),

  // Lists files/folders inside a folder ('root' = the account's root)
  // Works for both Google Drive and OneDrive — the backend detects the provider automatically
  listFiles: (accountId: string, folderId: string) =>
    ipcRenderer.invoke('drive:listFiles', accountId, folderId),

  // Searches all connected accounts simultaneously; returns merged results
  searchFiles: (query: string) => ipcRenderer.invoke('search:query', query),

  // Opens a file URL in the system's default web browser
  openFile: (url: string) => ipcRenderer.invoke('file:open', url),

  // Queries GitHub releases API to check if a newer version of the app is available
  checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates'),

  // Returns the current app version from package.json
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Listen for the Help menu "Check for Updates" click (triggered by native menu)
  onMenuCheckForUpdates: (callback: () => void) => {
    ipcRenderer.on('menu:check-for-updates', callback)
    return () => ipcRenderer.removeListener('menu:check-for-updates', callback)
  },

  // Listen for the Help menu "About Northlight Vault…" click (triggered by native menu)
  onMenuShowAbout: (callback: () => void) => {
    ipcRenderer.on('menu:show-about', callback)
    return () => ipcRenderer.removeListener('menu:show-about', callback)
  },

  // Returns notifications that have not yet been dismissed by the user
  getNotifications: () => ipcRenderer.invoke('notifications:get'),

  // Marks a notification as dismissed — it will not appear again after app restart
  dismissNotification: (id: string) => ipcRenderer.invoke('notifications:dismiss', id)
})
