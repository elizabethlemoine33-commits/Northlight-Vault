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

  // Lists files/folders inside a folder ('root' = the account's root)
  // Works for both Google Drive and OneDrive — the backend detects the provider automatically
  listFiles: (accountId: string, folderId: string) =>
    ipcRenderer.invoke('drive:listFiles', accountId, folderId),

  // Searches all connected accounts simultaneously; returns merged results
  searchFiles: (query: string) => ipcRenderer.invoke('search:query', query),

  // Opens a file URL in the system's default web browser
  openFile: (url: string) => ipcRenderer.invoke('file:open', url)
})
