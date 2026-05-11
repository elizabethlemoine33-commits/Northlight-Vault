// Generates resources/icon.png and resources/icon.ico
// No external packages — uses only Node.js built-ins (zlib, fs, path)
// Run with: node make-icon.js

const zlib = require('zlib')
const fs   = require('fs')
const path = require('path')

const W = 256, H = 256

// ── Colour helpers ──────────────────────────────────────────────────────────

function hex(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]
}

function lerp(a, b, t) {
  return a.map((v,i) => Math.round(v + (b[i]-v) * Math.max(0,Math.min(1,t))))
}

// Aurora gradient: teal → blue → purple → pink
function aurora(t) {
  t = Math.max(0,Math.min(1,t))
  const stops = [hex('#4fc3c8'), hex('#5b8dd9'), hex('#8b6fd4'), hex('#c46faa')]
  if (t <= 1/3) return lerp(stops[0], stops[1], t * 3)
  if (t <= 2/3) return lerp(stops[1], stops[2], (t-1/3)*3)
  return lerp(stops[2], stops[3], (t-2/3)*3)
}

function blend(base, color, alpha) {
  return base.map((v,i) => Math.round(color[i]*alpha + v*(1-alpha)))
}

// ── Geometry ─────────────────────────────────────────────────────────────────

// Document bounding box (centred, with room above for rays)
const DOC_L = 68, DOC_R = 188, DOC_T = 78, DOC_B = 226
const FOLD_X = DOC_R - 38  // where the top-right fold starts (x)
const FOLD_Y = DOC_T + 38  // where the fold ends (y)

function inDocument(x, y) {
  if (x < DOC_L || x > DOC_R || y < DOC_T || y > DOC_B) return false
  // Exclude folded triangle: above the fold diagonal line
  if (x >= FOLD_X && y <= FOLD_Y) {
    // Triangle vertices: (FOLD_X, DOC_T), (DOC_R, DOC_T), (DOC_R, FOLD_Y)
    // A point is inside the triangle if it's above the diagonal from (FOLD_X,FOLD_Y) to (DOC_R,DOC_T)
    const slope = (DOC_T - FOLD_Y) / (DOC_R - FOLD_X)
    const lineY = FOLD_Y + slope * (x - FOLD_X)
    if (y <= lineY) return false
  }
  return true
}

// Signed distance from a line segment (x1,y1)→(x2,y2) to point (px,py)
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2-x1, dy = y2-y1
  const lenSq = dx*dx + dy*dy
  if (lenSq === 0) return Math.hypot(px-x1, py-y1)
  const t = Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / lenSq))
  return Math.hypot(px - (x1+t*dx), py - (y1+t*dy))
}

// ── Pixel rendering ───────────────────────────────────────────────────────────

function createPixels() {
  const buf  = new Uint8Array(W * H * 4)
  const BG   = hex('#08080f')   // dark background — document pops against this
  const DARK = hex('#0c0a18')   // dark colour for lines on the gradient fill

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y*W+x)*4
      let a = 255

      // ── Background: dark midnight ──────────────────────────────────────
      let [r,g,b] = BG

      // ── Document body: aurora gradient fill ────────────────────────────
      if (inDocument(x, y)) {
        const dt = (x - DOC_L) / (DOC_R - DOC_L)   // 0=left(teal) → 1=right(pink)
        ;[r,g,b] = aurora(dt)
      }

      // ── Document border: dark (sits on top of bright gradient fill) ────
      const strokeW = 5
      const onLeft   = x >= DOC_L-strokeW && x <= DOC_L+strokeW && y >= DOC_T && y <= DOC_B
      const onRight  = x >= DOC_R-strokeW && x <= DOC_R+strokeW && y >= FOLD_Y && y <= DOC_B
      const onBottom = y >= DOC_B-strokeW && y <= DOC_B+strokeW && x >= DOC_L && x <= DOC_R
      const onTop    = y >= DOC_T-strokeW && y <= DOC_T+strokeW && x >= DOC_L && x <= FOLD_X

      if (onLeft || onRight || onBottom || onTop) {
        ;[r,g,b] = blend([r,g,b], DARK, 0.85)
      }

      // ── Fold diagonal: dark ────────────────────────────────────────────
      const foldDist = distToSegment(x, y, FOLD_X, DOC_T, DOC_R, FOLD_Y)
      if (foldDist <= strokeW) {
        ;[r,g,b] = blend([r,g,b], DARK, 0.80)
      }

      // ── Document text lines: dark, visible on bright gradient fill ─────
      const lineL = DOC_L + 18
      const lines = [
        { y: 158, r: DOC_R-18, alpha: 0.55 },
        { y: 178, r: DOC_R-36, alpha: 0.40 },
        { y: 198, r: DOC_R-60, alpha: 0.28 },
      ]
      for (const line of lines) {
        if (Math.abs(y - line.y) <= 4 && x >= lineL && x <= line.r) {
          ;[r,g,b] = blend([r,g,b], DARK, line.alpha)
        }
      }

      // ── Aurora rays: aurora-coloured above the dark background ─────────
      const rays = [
        { cx:128, topY: 6, botY:78, hw: 9, t:0.55, op:1.00 },
        { cx:108, topY:14, botY:68, hw: 6, t:0.72, op:0.90 },
        { cx:148, topY:14, botY:68, hw: 6, t:0.38, op:0.90 },
        { cx: 86, topY:26, botY:60, hw: 4, t:0.85, op:0.65 },
        { cx:170, topY:26, botY:60, hw: 4, t:0.20, op:0.65 },
      ]
      for (const ray of rays) {
        if (y >= ray.topY && y <= ray.botY) {
          const dx = Math.abs(x - ray.cx)
          if (dx <= ray.hw + 1) {
            const vy = (y-ray.topY)/(ray.botY-ray.topY)
            const edgeAlpha = Math.max(0, 1-(dx/ray.hw))
            const fadeAlpha = ray.op * (1 - vy*0.80) * edgeAlpha
            if (fadeAlpha > 0.01) {
              ;[r,g,b] = blend([r,g,b], aurora(ray.t), fadeAlpha)
            }
          }
        }
      }

      buf[i]=r; buf[i+1]=g; buf[i+2]=b; buf[i+3]=a
    }
  }
  return buf
}

// ── PNG encoding ──────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i=0; i<256; i++) {
    let c=i
    for (let j=0; j<8; j++) c = c&1 ? 0xEDB88320^(c>>>1) : c>>>1
    t[i]=c
  }
  return t
})()

function crc32(data) {
  let c = 0xFFFFFFFF
  for (let i=0; i<data.length; i++) c = CRC_TABLE[(c^data[i])&0xff]^(c>>>8)
  return (c^0xFFFFFFFF)>>>0
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data)
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(d.length,0)
  const crcVal = Buffer.allocUnsafe(4); crcVal.writeUInt32BE(crc32(Buffer.concat([t,d])),0)
  return Buffer.concat([len, t, d, crcVal])
}

function encodePNG(rgba, w, h) {
  // Convert RGBA → RGB scanlines with filter byte 0
  const raw = Buffer.allocUnsafe(h * (1 + w*3))
  for (let y=0; y<h; y++) {
    raw[y*(w*3+1)] = 0
    for (let x=0; x<w; x++) {
      const si=(y*w+x)*4, di=y*(w*3+1)+1+x*3
      raw[di]=rgba[si]; raw[di+1]=rgba[si+1]; raw[di+2]=rgba[si+2]
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 })

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4)
  ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0

  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

// ── ICO encoding (embeds the PNG directly — supported on Windows Vista+) ─────

function encodeICO(pngData) {
  const header = Buffer.allocUnsafe(6)
  header.writeUInt16LE(0, 0)   // reserved
  header.writeUInt16LE(1, 2)   // type: ICO
  header.writeUInt16LE(1, 4)   // image count

  const entry = Buffer.allocUnsafe(16)
  entry[0] = 0                         // width  (0 = 256)
  entry[1] = 0                         // height (0 = 256)
  entry[2] = 0                         // color count (0 = no palette)
  entry[3] = 0                         // reserved
  entry.writeUInt16LE(1, 4)            // planes
  entry.writeUInt16LE(32, 6)           // bit depth
  entry.writeUInt32LE(pngData.length, 8)    // data size
  entry.writeUInt32LE(6+16, 12)        // data offset = after header+entry

  return Buffer.concat([header, entry, pngData])
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('Rendering icon pixels…')
const pixels = createPixels()

console.log('Encoding PNG…')
const png = encodePNG(pixels, W, H)

const pngPath = path.join(__dirname, 'resources', 'icon.png')
const icoPath = path.join(__dirname, 'resources', 'icon.ico')

fs.writeFileSync(pngPath, png)
console.log(`✓ icon.png  written (${png.length} bytes)`)

const ico = encodeICO(png)
fs.writeFileSync(icoPath, ico)
console.log(`✓ icon.ico  written (${ico.length} bytes)`)
