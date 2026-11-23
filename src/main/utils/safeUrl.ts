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
