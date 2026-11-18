import { RememberedDetails } from '../components/RememberedDetails'
import { useRef, useState } from 'react'
import { annotations, checkAnnotations, clip, evidence, personLabel, segmentAt, timecode, type Finding } from './timeline'
import './caption.css'

const mediaPath = '/caption/studio.mp4?v=face-ellipse-3'
const posterPath = '/caption/studio-poster.webp?v=face-ellipse-3'
const ticks = [0, 2, 4, 6, 8, 10, 12]

export default function CaptionInspection() {
  const video = useRef<HTMLVideoElement>(null)
  const findingHeading = useRef<HTMLHeadingElement>(null)
  const clipRequested = useRef(false)
  const pendingSeek = useRef<number | null>(null)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const annotation = segmentAt(annotations, time)
  const finding = findings?.find(({ id }) => id === selected)

  function seek(seconds: number) {
    const target = Math.max(0, Math.min(clip.duration, seconds))
    const player = video.current
    if (player) {
      player.pause()
      if (player.readyState > 0) player.currentTime = target
      else if (!mediaError) {
        pendingSeek.current = target
        if (!clipRequested.current) {
          clipRequested.current = true
          player.preload = 'metadata'
          player.load()
        }
      }
    }
    setTime(target)
  }

  function scrub(seconds: number) {
    setSelected(null)
    seek(seconds)
  }

  function togglePlayback() {
    const player = video.current
    if (!player || mediaError) return
    if (!player.paused) {
      player.pause()
      return
    }
    clipRequested.current = true
    setSelected(null)
    if (player.ended) player.currentTime = 0
    player.play().catch(() => setPlaying(false))
  }

  function inspect(issue: Finding) {
    setSelected(issue.id)
    seek(issue.seek)
    requestAnimationFrame(() => findingHeading.current?.focus())
  }

  return (
    <>
      <header className="cap-heading">
        <div>
          <h2 id="caption-inspection-title">Inspect the caption track.</h2>
          <p>Scrub the footage beside its annotations, then compare the track with the reference.</p>
        </div>
        <p className="cap-sim mono"><span /> Simulated QC · Synthetic footage</p>
      </header>

      <div className="cap-workbench">
        <div className="cap-player">
          <div className="cap-toolbar mono">
            <span>{clip.id} · Studio handoff</span>
            <span>{clip.duration}s / {clip.fps} fps / Silent</span>
          </div>

          <video
            ref={video}
            src={mediaPath}
            poster={posterPath}
            preload="none"
            playsInline
            aria-label="Synthetic footage of Mira and Leon at a workbench"
            onLoadedMetadata={(event) => {
              if (pendingSeek.current !== null) {
                event.currentTarget.currentTime = pendingSeek.current
                pendingSeek.current = null
              }
            }}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => { setMediaError(true); setPlaying(false) }}
          />

          <div className="cap-timeline">
            <div className="cap-transport">
              <button type="button" className="cap-button mono" disabled={mediaError} onClick={togglePlayback}>{playing ? 'Pause' : 'Play'}</button>
              <span className="cap-time mono" aria-hidden="true">{timecode(time)} / {timecode(clip.duration)}</span>
            </div>
            {mediaError && <p className="cap-note" role="status">Video unavailable. The annotation track and checks are available.</p>}
            <input id="caption-seek" className="cap-range" type="range" min={0} max={clip.duration} step={0.01}
              value={time} aria-label="Video timeline" aria-valuetext={timecode(time)}
              onChange={(event) => scrub(Number(event.currentTarget.value))} />
            <div className="cap-ticks mono" aria-hidden="true">{ticks.map((tick) => <span key={tick}>{tick}s</span>)}</div>
            <div className="cap-track" role="group" aria-label="Annotation segments">
              {annotations.map((segment) => (
                <button key={segment.id} type="button" className="cap-segment mono"
                  style={{ left: `${segment.start / clip.duration * 100}%`, width: `${(segment.end - segment.start) / clip.duration * 100}%` }}
                  data-flag={findings?.some((issue) => issue.row === segment.id)}
                  aria-pressed={annotation?.id === segment.id}
                  aria-label={`${segment.id}: ${timecode(segment.start)}–${timecode(segment.end)}`}
                  onClick={() => scrub((segment.start + segment.end) / 2)}>{segment.id}</button>
              ))}
              {findings?.filter((issue) => issue.row === null).map((issue) => (
                <button key={issue.id} type="button" className="cap-segment cap-gap mono"
                  style={{ left: `${issue.start / clip.duration * 100}%`, width: `${(issue.end - issue.start) / clip.duration * 100}%` }}
                  aria-label={`Inspect gap ${timecode(issue.start)}–${timecode(issue.end)}`} onClick={() => inspect(issue)}>Gap</button>
              ))}
            </div>
          </div>
        </div>

        <aside className="cap-inspector" aria-label="Annotation inspector">
          <div className="cap-annotation">
            <p className="cap-kicker mono">Caption at {timecode(time)}</p>
            {annotation ? (
              <>
                <h3>{annotation.text}</h3>
                <dl>
                  <div><dt>Person ID</dt><dd>{personLabel(annotation.person)}</dd></div>
                  <div><dt>Interval</dt><dd>{timecode(annotation.start)}–{timecode(annotation.end)}</dd></div>
                  <div><dt>Segment</dt><dd>{annotation.id}</dd></div>
                </dl>
              </>
            ) : (
              <><h3>{time === clip.duration ? 'End of clip' : 'Uncaptioned interval'}</h3><p>Move the playhead to inspect a segment.</p></>
            )}
          </div>
          {finding && (
            <section className="cap-evidence" aria-labelledby="caption-finding-title">
              <p className="cap-kicker mono">{timecode(finding.start)}–{timecode(finding.end)}</p>
              <h3 id="caption-finding-title" tabIndex={-1} ref={findingHeading}>{finding.kind}</h3>
              <dl>
                <div><dt>Observed</dt><dd>{finding.observed}</dd></div>
                <div><dt>Reference</dt><dd>{finding.expected}</dd></div>
              </dl>
              <p className="cap-fix">{finding.fix}</p>
            </section>
          )}
        </aside>
      </div>

      <section className="cap-checks" aria-labelledby="caption-checks-title">
        <div className="cap-check-head">
          <div>
            <h3 id="caption-checks-title">Annotation checks</h3>
            <p role="status" className="cap-note">{findings ? `${findings.length} issues in this synthetic track` : 'Compare the submitted track with the fixture reference.'}</p>
          </div>
          <button type="button" className="cap-button cap-primary mono" onClick={() => { setFindings(checkAnnotations(annotations)); setSelected(null) }}>Run checks <span aria-hidden="true">↘</span></button>
        </div>
        {findings && (
          <ol className="cap-results">
            {findings.map((issue) => (
              <li key={issue.id}>
                <button type="button" aria-pressed={selected === issue.id} onClick={() => inspect(issue)}>
                  <span className="cap-result-time mono">{timecode(issue.start)}–{timecode(issue.end)}</span>
                  <span>{issue.kind}</span>
                  <span className="cap-result-link mono">Inspect <b aria-hidden="true">↗</b></span>
                </button>
              </li>
            ))}
          </ol>
        )}
        <RememberedDetails id="caption-checks" className="cap-details">
          <summary>How the checks work</summary>
          <p>Continuity checks for uncovered intervals longer than one frame. Caption and person checks compare the annotation’s action and actor at its midpoint with the authored reference. The reference comes from this animation’s script.</p>
        </RememberedDetails>
        <RememberedDetails id="caption-transcript" className="cap-details">
          <summary>Visual transcript of the synthetic clip</summary>
          <ol>{evidence.map((segment) => (
            <li key={segment.id}><span className="mono">{timecode(segment.start)}–{timecode(segment.end)}</span><span>{personLabel(segment.person)}. {segment.text}</span></li>
          ))}</ol>
        </RememberedDetails>
      </section>
    </>
  )
}
