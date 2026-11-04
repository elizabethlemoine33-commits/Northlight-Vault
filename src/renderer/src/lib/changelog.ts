// Turns CHANGELOG.md into plain data the "What's new" window can show.
// CHANGELOG.md stays the only place the history is written. This reads just the
// few markdown pieces that file uses: version headings, section headings,
// bullets, **bold**, `code` and [links](https://...). Anything else is ignored.

export type Piece =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; text: string; url: string }

export interface ChangelogSection {
  title: string
  items: Piece[][]
}

export interface ChangelogVersion {
  version: string
  date: string
  sections: ChangelogSection[]
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/

export function parseInline(line: string): Piece[] {
  const pieces: Piece[] = []
  for (const part of line.split(INLINE)) {
    if (!part) continue
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      pieces.push({ kind: 'bold', text: part.slice(2, -2) })
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      pieces.push({ kind: 'code', text: part.slice(1, -1) })
    } else {
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (link) pieces.push({ kind: 'link', text: link[1], url: link[2] })
      else pieces.push({ kind: 'text', text: part })
    }
  }
  return pieces
}

export function parseChangelog(markdown: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = []
  let current: ChangelogVersion | null = null
  let section: ChangelogSection | null = null

  // Drop HTML comments such as the note under [Unreleased].
  const text = markdown.replace(/<!--[\s\S]*?-->/g, '')

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd()

    const versionHeading = line.match(/^##\s+\[([^\]]+)\](?:\s+[—–-]\s+(.+))?$/)
    if (versionHeading) {
      const name = versionHeading[1]
      section = null
      // "Unreleased" is work in progress, so it is never shown to users.
      current = /^unreleased$/i.test(name) ? null : { version: name, date: versionHeading[2] ?? '', sections: [] }
      if (current) versions.push(current)
      continue
    }

    if (!current) continue

    const sectionHeading = line.match(/^###\s+(.+)$/)
    if (sectionHeading) {
      section = { title: sectionHeading[1].trim(), items: [] }
      current.sections.push(section)
      continue
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/)
    if (bullet) {
      if (!section) {
        section = { title: '', items: [] }
        current.sections.push(section)
      }
      section.items.push(parseInline(bullet[1]))
    }
  }

  return versions.filter((v) => v.sections.some((s) => s.items.length > 0))
}

// "Changed (sign-in)" -> base word "Changed" picks the label colour.
export function sectionKind(title: string): 'added' | 'changed' | 'fixed' | 'privacy' | 'other' {
  const word = title.split(/[\s(]/)[0].toLowerCase()
  if (word === 'added') return 'added'
  if (word === 'changed') return 'changed'
  if (word === 'fixed') return 'fixed'
  if (word === 'privacy' || word === 'security') return 'privacy'
  return 'other'
}
