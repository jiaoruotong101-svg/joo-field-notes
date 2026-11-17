export const sources = {
  tag: { label: '#fieldstudy', description: 'Tag discovery' },
  sound: { label: 'Studio loop', description: 'Sound discovery' },
} as const

type Source = keyof typeof sources

export type FixtureRow = {
  source: Source
  creator: string
  video: string
  url: string
}

function row(source: Source, creator: string, video: string, suffix = ''): FixtureRow {
  return { source, creator, video, url: `https://video.example.invalid/@${creator}/video/${video}${suffix}` }
}

export const pages: FixtureRow[][] = [
  [row('tag', 'mira', '101'), row('tag', 'leon', '102'), row('sound', 'mira', '103'), row('sound', 'aya', '104')],
  [row('sound', 'mira', '101', '?utm_source=share'), row('tag', 'ren', '105'), row('tag', 'aya', '106'), row('sound', 'noor', '107')],
  [row('tag', 'aya', '104', '/#preview'), row('sound', 'ren', '105', '?share_id=mock-218'), row('tag', 'leon', '108'), row('sound', 'noor', '109')],
]

export function canonicalVideo(raw: string) {
  const url = new URL(raw)
  url.pathname = url.pathname.replace(/\/+$/, '')
  url.hash = ''
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith('utm_') || key === 'share_id') url.searchParams.delete(key)
  }
  url.searchParams.sort()
  return url.href
}

export type ProcessedRow = FixtureRow & {
  id: string
  page: number
  canonical: string
  duplicateOf: string | null
}

export type VideoRecord = {
  first: ProcessedRow
  sources: Source[]
}

export function buildDiscovery(scanned: number[]) {
  const videos = new Map<string, VideoRecord>()
  const rows: ProcessedRow[] = []

  for (const page of new Set(scanned)) {
    pages[page].forEach((fixture, index) => {
      const canonical = canonicalVideo(fixture.url)
      const existing = videos.get(canonical)
      const record = { ...fixture, id: `P${page + 1}-${index + 1}`, page, canonical, duplicateOf: existing?.first.id ?? null }
      rows.push(record)
      if (existing) {
        if (!existing.sources.includes(record.source)) existing.sources.push(record.source)
      } else {
        videos.set(canonical, { first: record, sources: [record.source] })
      }
    })
  }

  return { rows, videos, duplicates: rows.length - videos.size }
}

export function exportCsv(videos: Map<string, VideoRecord>) {
  const quote = (value: string) => '"' + value.replaceAll('"', '""') + '"'
  return [
    'simulation,video_id,creator,canonical_url,sources,first_page',
    ...Array.from(videos.values(), ({ first, sources: origins }) => [
      'true', first.video, '@' + first.creator, first.canonical,
      origins.map((key) => sources[key].label).join(' | '), String(first.page + 1),
    ].map(quote).join(',')),
  ].join('\r\n') + '\r\n'
}
