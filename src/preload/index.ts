import { contextBridge, ipcRenderer } from 'electron'

// Everything listed here is callable from the React frontend.
// Nothing else from Node.js or Electron is accessible to the renderer.
contextBridge.exposeInMainWorld('api', {
  // Returns the list of connected Google accounts
  getAccounts: () => ipcRenderer.invoke('accounts:get'),

  // Opens Google sign-in browser window; returns the new account on success
  connectAccount: () => ipcRenderer.invoke('accounts:connect'),

  // Removes an account's tokens and clears it from the list
  disconnectAccount: (accountId: string) => ipcRenderer.invoke('accounts:disconnect', accountId),

  // Lists files/folders inside a Drive folder ('root' = the account's Drive root)
  listFiles: (accountId: string, folderId: string) =>
    ipcRenderer.invoke('drive:listFiles', accountId, folderId),

  // Searches all connected accounts simultaneously; returns merged results
  searchFiles: (query: string) => ipcRenderer.invoke('search:query', query)
})
