import { contextBridge } from 'electron'

// contextBridge.exposeInMainWorld() is how we safely expose backend
// functions to the frontend. Only what's listed here can be called
// from the React app — nothing else from Node.js or Electron is accessible.

// For now this is empty — we'll add functions here in Phase 2 when
// we wire up Google authentication.
contextBridge.exposeInMainWorld('api', {
  // Phase 2: auth functions will be added here
  // Phase 4: file listing functions will be added here
  // Phase 5: search functions will be added here
})
