import { useMemo, useRef, useState } from 'react'
import { buildDiscovery, canonicalVideo, exportCsv, pages, sources, type ProcessedRow } from './fixture'
import { StarMap, type StarLink, type StarNode } from './StarMap'
import './crawler.css'

const fixture = pages.flat()
const creators = Array.from(new Set(fixture.map((entry) => entry.creator)))
const videoSlots = Array.from(new Set(fixture.map((entry) => canonicalVideo(entry.url))))
const sourceNodes = Object.entries(sources).map(([id, source], index): StarNode => ({
  id: 'source:' + id, label: source.label, kind: 'source', x: 0.15, y: 0.36 + index * 0.34,
}))

function graphFor(discovery: ReturnType<typeof buildDiscovery>) {
  const seenCreators = new Set(discovery.rows.map((entry) => entry.creator))
  const nodes: StarNode[] = [
    ...sourceNodes,
    ...creators.flatMap((creator, index): StarNode[] => seenCreators.has(creator) ? [{
      id: 'creator:' + creator, label: '@' + creator, kind: 'creator', x: .5, y: .21 + index * .165,
    }] : []),
    ...videoSlots.flatMap((canonical, index): StarNode[] => {
      const video = discovery.videos.get(canonical)
      return video ? [{
        id: canonical, label: 'V-' + video.first.video, kind: 'video', x: .85, y: .15 + index * .096,
      }] : []
    }),
  ]
  const pairs = new Map<string, StarLink>()
  function link(from: string, to: string) {
    pairs.set(from + '|' + to, { from, to })
  }
  for (const row of discovery.rows) {
    link('source:' + row.source, 'creator:' + row.creator)
    link('creator:' + row.creator, row.canonical)
  }
  return { nodes, links: Array.from(pairs.values()) }
}

function containsNode(row: ProcessedRow, id: string) {
  return 'source:' + row.source === id || 'creator:' + row.creator === id || row.canonical === id
}

export default function CrawlerDemo() {
  const [page, setPage] = useState(0)
  const [scanned, setScanned] = useState<number[]>([])
  const [active, setActive] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const discovery = useMemo(() => buildDiscovery(scanned), [scanned])
  const graph = useMemo(() => graphFor(discovery), [discovery])
  const inspected = graph.nodes.find((node) => node.id === active)
  const related = useMemo(() => active ? discovery.rows.filter((row) => containsNode(row, active)) : [], [discovery, active])
  const highlighted = useMemo(() => new Set(related.flatMap((row) => [
    `source:${row.source}|creator:${row.creator}`, `creator:${row.creator}|${row.canonical}`,
  ])), [related])
  const included = new Set(related.map((row) => row.canonical)).size
  const isScanned = scanned.includes(page)
  const processed = discovery.rows.filter((row) => row.page === page)
  const csv = exportCsv(discovery.videos)

  function scanPage() {
    setScanned((previous) => previous.includes(page) ? previous : [...previous, page])
    setActive(null)
  }

  function reset() {
    setScanned([])
    setActive(null)
    setPage(0)
  }

  function download() {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'url-crawler-simulated.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="crawler-demo" aria-labelledby="crawler-title">
      <header className="crawler-heading">
        <div>
          <h2 id="crawler-title">Discovery star map</h2>
          <p>Scan a fixture page to trace videos back to creators and sources.</p>
        </div>
        <p className="crawler-sim mono"><span aria-hidden="true" /> Synthetic dataset · Local simulation</p>
      </header>

      <div className="crawler-console">
        <div className="crawler-workspace">
          <div className="crawler-toolbar">
            <div className="crawler-pages" role="group" aria-label="Fixture pages">
              <span className="mono" aria-hidden="true">Page</span>
              {pages.map((_, index) => (
                <button type="button" className="crawler-btn mono" key={index} aria-pressed={index === page}
                  aria-label={`Page ${index + 1}${scanned.includes(index) ? ', scanned' : ''}`} onClick={() => setPage(index)}>
                  {index + 1}{scanned.includes(index) && <span aria-hidden="true"> ✓</span>}
                </button>
              ))}
            </div>
            <button type="button" className="crawler-btn crawler-primary mono" onClick={scanPage} disabled={isScanned}>
              {isScanned ? `Page ${page + 1} scanned` : `Discover page ${page + 1}`}
            </button>
          </div>
          <StarMap nodes={graph.nodes} links={graph.links} active={active} highlighted={highlighted} onSelect={setActive} />
        </div>

        <aside className="crawler-inspector" aria-label="Discovery inspector">
          <div className="crawler-metrics" role="status" aria-label="Scan totals">
            <div><strong>{discovery.rows.length}</strong><span>Rows scanned</span></div>
            <div><strong>{discovery.videos.size}</strong><span>Unique videos</span></div>
            <div><strong>{discovery.duplicates}</strong><span>Duplicates</span></div>
          </div>
          <div className="crawler-inspect">
            {inspected ? (
              <>
                <p className="crawler-type mono">{inspected.kind}</p>
                <h3>{inspected.label}</h3>
                {inspected.kind === 'video' && <code>{inspected.id}</code>}
                {inspected.kind === 'source' && <p>{sources[inspected.id === 'source:tag' ? 'tag' : 'sound'].description}</p>}
                <p>{included} {included === 1 ? 'unique video' : 'unique videos'} across {related.length} {related.length === 1 ? 'discovered row' : 'discovered rows'}.</p>
                {related.length > 0 && <ul className="crawler-provenance">{related.map((entry) => (
                  <li key={entry.id}><span className="mono">{entry.id}</span> {sources[entry.source].label} <span aria-hidden="true">→</span> @{entry.creator} <span aria-hidden="true">→</span> V-{entry.video}</li>
                ))}</ul>}
                <button type="button" className="crawler-text-btn" onClick={() => setActive(null)}>Show all connections</button>
              </>
            ) : (
              <>
                <h3>{scanned.length ? 'Follow a connection' : 'Start with a source'}</h3>
                <p>{scanned.length ? 'Select a node to inspect its discovery records.' : 'Discover a page to connect the two source seeds to creators and videos.'}</p>
              </>
            )}
          </div>
          <div className="crawler-export">
            <button type="button" className="crawler-btn mono" disabled={discovery.videos.size === 0} onClick={() => dialog.current?.showModal()}>Preview CSV <span aria-hidden="true">↘</span></button>
            <button type="button" className="crawler-text-btn" disabled={scanned.length === 0 && page === 0 && !active} onClick={reset}>Reset</button>
          </div>
        </aside>
      </div>

      <section className="crawler-ledger" aria-labelledby="crawler-page-title">
        <div className="crawler-ledger-heading">
          <h3 id="crawler-page-title">Page {page + 1} results</h3>
          <p className="mono">{isScanned ? `${processed.filter((entry) => entry.duplicateOf).length} duplicate rows` : 'Fixture preview · Ready to scan'}</p>
        </div>
        <ol className="crawler-rows">
          {pages[page].map((entry, index) => {
            const result = processed[index]
            return (
              <li key={`P${page + 1}-${index + 1}`}>
                <span className="mono crawler-row-id">P{page + 1}-{index + 1}</span>
                <span className="crawler-row-origin">{sources[entry.source].label} <span aria-hidden="true">→</span> @{entry.creator}</span>
                <div className="crawler-row-url">
                  <code>{entry.url}</code>
                  {result?.duplicateOf && <p>Canonical <code>{result.canonical}</code></p>}
                </div>
                <span className={`crawler-row-state mono ${result?.duplicateOf ? 'crawler-repeat' : ''}`}>
                  {result ? result.duplicateOf ? `Repeat of ${result.duplicateOf}` : 'Unique' : 'Pending'}
                </span>
              </li>
            )
          })}
        </ol>
        <details className="crawler-details">
          <summary>How the demo compares URLs</summary>
          <p>The fixture removes fragments, trailing path slashes, and the tracking keys <code>utm_*</code> and <code>share_id</code>. Other query keys are preserved and sorted. The first scanned row keeps the video record, and repeats can add source provenance.</p>
        </details>
      </section>

      <dialog className="crawler-dialog" ref={dialog} aria-labelledby="crawler-export-title">
        <h3 id="crawler-export-title">Simulated CSV export</h3>
        <p>{discovery.videos.size} unique videos from {scanned.length} {scanned.length === 1 ? 'page' : 'pages'}. Each row is marked as a simulation.</p>
        <textarea aria-label="CSV preview" value={csv} readOnly wrap="off" rows={Math.min(discovery.videos.size + 1, 8)} />
        <div>
          <button type="button" className="crawler-btn mono" autoFocus onClick={() => dialog.current?.close()}>Close preview</button>
          <button type="button" className="crawler-btn crawler-primary mono" onClick={download}>Download CSV <span aria-hidden="true">↓</span></button>
        </div>
      </dialog>
    </section>
  )
}
