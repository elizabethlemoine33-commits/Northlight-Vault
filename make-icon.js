// Generates resources/icon.png and resources/icon.ico from the source PNG.
// Run with: node make-icon.js

const fs   = require('fs')
const path = require('path')

const SRC  = path.join(__dirname, 'resources', 'northlight-vault-icon-512x512.png')
const PNG  = path.join(__dirname, 'resources', 'icon.png')
const ICO  = path.join(__dirname, 'resources', 'icon.ico')

// Read the source PNG
const pngData = fs.readFileSync(SRC)

// icon.png — use the source directly (Electron scales as needed)
fs.writeFileSync(PNG, pngData)
console.log(`✓ icon.png  written (${pngData.length} bytes)`)

// icon.ico — ICO container embedding the PNG (Windows Vista+ supports this)
// Directory entry uses 0,0 for width/height to indicate 256×256 (ICO max per entry byte)
const header = Buffer.allocUnsafe(6)
header.writeUInt16LE(0, 0)  // reserved
header.writeUInt16LE(1, 2)  // type: ICO
header.writeUInt16LE(1, 4)  // 1 image

const entry = Buffer.allocUnsafe(16)
entry[0] = 0                              // width  (0 = 256+)
entry[1] = 0                              // height (0 = 256+)
entry[2] = 0                              // palette colours (0 = none)
entry[3] = 0                              // reserved
entry.writeUInt16LE(1, 4)                 // colour planes
entry.writeUInt16LE(32, 6)               // bits per pixel
entry.writeUInt32LE(pngData.length, 8)   // size of image data
entry.writeUInt32LE(6 + 16, 12)          // offset of image data

const ico = Buffer.concat([header, entry, pngData])
fs.writeFileSync(ICO, ico)
console.log(`✓ icon.ico  written (${ico.length} bytes)`)
