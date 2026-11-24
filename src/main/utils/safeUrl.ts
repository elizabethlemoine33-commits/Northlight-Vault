// Decides which links the app may hand to the operating system to open.
//
// Anything that could start a program or open a local file (file:, javascript:, ms-msdt:, custom
// app protocols, and so on) is refused. Only web pages (https:) and email links (mailto:) are allowed.
// The address is parsed rather than checked by its first characters, so odd spellings like
// "HTTPS://", "https:\\host" or leading spaces are judged by what they really are.

const ALLOWED_PROTOCOLS = new Set(['https:', 'mailto:'])

export function isSafeExternalUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false
  const text = url.trim()
  if (text === '' || text !== url) return false // leading or trailing spaces are not a clean link
  let parsed: URL
  try {
    parsed = new URL(text)
  } catch {
    return false
  }
  return ALLOWED_PROTOCOLS.has(parsed.protocol)
}

// A short, safe label for a link that was refused, for a log line. It carries the scheme ONLY
// ("file", "javascript", "ms-msdt" ...) and never any other part of the address: no file names,
// no hosts, no query text. Anything that is not a plain scheme name becomes a fixed word.
export function refusedLinkLabel(url: unknown): string {
  if (typeof url !== 'string') return 'not-text'
  let protocol: string
  try {
    protocol = new URL(url.trim()).protocol
  } catch {
    return 'not-a-url' // relative paths, empty text, "C:\..." style paths and so on
  }
  const scheme = protocol.slice(0, -1).toLowerCase()
  return /^[a-z][a-z0-9+.-]{0,19}$/.test(scheme) ? scheme : 'odd-scheme'
}

// True only when `target` is the app's own page (the same document, ignoring any "#..." or "?..." part).
// Used to stop the app window from ever navigating away to another page: a plain link, a redirect or a
// form post inside the window would otherwise load outside content into a window that has the app's bridge.
// appUrl is the address the window was first loaded with: the built index.html in the packaged app, or the
// dev server in development. Different protocol, host, port or file path means "not the app".
export function isAppNavigation(target: unknown, appUrl: unknown): boolean {
  if (typeof target !== 'string' || typeof appUrl !== 'string') return false
  let a: URL
  let b: URL
  try {
    a = new URL(target)
    b = new URL(appUrl)
  } catch {
    return false
  }
  if (a.protocol !== b.protocol) return false
  if (a.protocol === 'file:') return a.host === b.host && a.pathname === b.pathname
  return a.origin === b.origin && a.pathname === b.pathname
}
