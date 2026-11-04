// Search result filters: file type, modified date and account.
// Runs in the renderer on results already fetched by the main process, so it
// needs no new permissions and makes no extra network requests.

// Keep in step with PER_ACCOUNT_LIMIT in src/main/search/index.ts.
export const PER_ACCOUNT_RESULT_LIMIT = 100

export type FileTypeKey =
  | 'folder'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'other'

export const FILE_TYPE_OPTIONS: { key: FileTypeKey; label: string }[] = [
  { key: 'folder', label: 'Folders' },
  { key: 'document', label: 'Documents' },
  { key: 'spreadsheet', label: 'Spreadsheets' },
  { key: 'presentation', label: 'Presentations' },
  { key: 'pdf', label: 'PDFs' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
  { key: 'audio', label: 'Audio' },
  { key: 'other', label: 'Other' }
]

export type DateRangeKey = 'any' | 'day' | 'week' | 'month' | 'year'

export const DATE_RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: 'any', label: 'Any time' },
  { key: 'day', label: 'Past 24 hours' },
  { key: 'week', label: 'Past 7 days' },
  { key: 'month', label: 'Past 30 days' },
  { key: 'year', label: 'Past year' }
]

export interface SearchFilters {
  type: FileTypeKey | 'all'
  modified: DateRangeKey
  accountId: string // an account id, or 'all'
}

export const DEFAULT_FILTERS: SearchFilters = { type: 'all', modified: 'any', accountId: 'all' }

export function activeFilterCount(f: SearchFilters): number {
  return (f.type !== 'all' ? 1 : 0) + (f.modified !== 'any' ? 1 : 0) + (f.accountId !== 'all' ? 1 : 0)
}

const EXTENSION_TYPES: Record<string, FileTypeKey> = {
  doc: 'document', docx: 'document', odt: 'document', rtf: 'document', txt: 'document', md: 'document', pages: 'document',
  xls: 'spreadsheet', xlsx: 'spreadsheet', csv: 'spreadsheet', tsv: 'spreadsheet', ods: 'spreadsheet', numbers: 'spreadsheet',
  ppt: 'presentation', pptx: 'presentation', odp: 'presentation', key: 'presentation',
  pdf: 'pdf',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', bmp: 'image', svg: 'image', heic: 'image', tif: 'image', tiff: 'image',
  mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', webm: 'video', m4v: 'video',
  mp3: 'audio', wav: 'audio', m4a: 'audio', flac: 'audio', aac: 'audio', ogg: 'audio'
}

function typeFromMime(mime: string): FileTypeKey {
  const m = mime.toLowerCase()
  if (!m) return 'other'
  if (m.startsWith('image/')) return 'image'
  if (m.startsWith('video/')) return 'video'
  if (m.startsWith('audio/')) return 'audio'
  if (m.includes('pdf')) return 'pdf'
  // Check spreadsheets and presentations before documents: Office mime types
  // such as "...officedocument.spreadsheetml.sheet" also contain "document".
  if (m.includes('spreadsheet') || m.includes('excel') || m === 'text/csv') return 'spreadsheet'
  if (m.includes('presentation') || m.includes('powerpoint')) return 'presentation'
  if (m.includes('document') || m.includes('word') || m === 'text/plain' || m === 'application/rtf') return 'document'
  return 'other'
}

export function fileTypeOf(file: { name: string; mimeType: string; isFolder: boolean }): FileTypeKey {
  if (file.isFolder) return 'folder'
  const fromMime = typeFromMime(file.mimeType)
  if (fromMime !== 'other') return fromMime
  // Dropbox (and some OneDrive files) report no useful mime type, so fall back to the extension.
  const dot = file.name.lastIndexOf('.')
  if (dot > 0) return EXTENSION_TYPES[file.name.slice(dot + 1).toLowerCase()] ?? 'other'
  return 'other'
}

const RANGE_MS: Record<Exclude<DateRangeKey, 'any'>, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
}

function withinRange(iso: string | null, range: DateRangeKey, now: number): boolean {
  if (range === 'any') return true
  if (!iso) return false
  const t = new Date(iso).getTime()
  return !Number.isNaN(t) && now - t <= RANGE_MS[range]
}

interface Filterable {
  name: string
  mimeType: string
  isFolder: boolean
  modifiedTime: string | null
  accountId: string
}

export function applyFilters<T extends Filterable>(results: T[], filters: SearchFilters): T[] {
  if (activeFilterCount(filters) === 0) return results
  const now = Date.now()
  return results.filter(
    (r) =>
      (filters.accountId === 'all' || r.accountId === filters.accountId) &&
      (filters.type === 'all' || fileTypeOf(r) === filters.type) &&
      withinRange(r.modifiedTime, filters.modified, now)
  )
}

// True when any one account returned as many results as we ask for, meaning
// there may be more matches that were not fetched.
export function hitResultLimit(results: { accountId: string }[]): boolean {
  const counts = new Map<string, number>()
  for (const r of results) counts.set(r.accountId, (counts.get(r.accountId) ?? 0) + 1)
  for (const n of counts.values()) if (n >= PER_ACCOUNT_RESULT_LIMIT) return true
  return false
}
