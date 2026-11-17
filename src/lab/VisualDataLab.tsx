import { useEffect, useRef, useState } from 'react'
import { FrameViewer } from './FrameViewer'
import {
  buildReport, clip, decisionLabels, faceMinimum, faceVerdict, samples, sampleTime,
  source, specRules, verdictLabels, type Decision, type Report, type Review, type Verdict,
} from './fixture'
import './lab.css'

function VerdictLabel({ verdict }: { verdict: Verdict }) {
  return <span className={`qc-verdict qc-${verdict} mono`}>{verdictLabels[verdict]}</span>
}

function ReportPanel({ report }: { report: Report }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [report])

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.clip.id.toLowerCase()}-simulated-qc.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="qc-report" aria-labelledby="qc-report-title">
      <div className="qc-report-head">
        <div>
          <p className="mono qc-kicker">{report.clip.id} / SYNTHETIC EVIDENCE</p>
          <h3 ref={heading} tabIndex={-1} id="qc-report-title">Simulated QC report</h3>
        </div>
        <button type="button" className="qc-action mono" onClick={download}>Download JSON <span aria-hidden="true">↓</span></button>
      </div>
      <dl className="qc-report-results">
        <div><dt>Specification checks</dt><dd><VerdictLabel verdict={report.automated.specifications} /></dd></div>
        <div><dt>Simulated face sampling</dt><dd><VerdictLabel verdict={report.automated.faceSampling} /></dd></div>
        <div><dt>Reviewer disposition</dt><dd>{decisionLabels[report.reviewerDisposition]}</dd></div>
      </dl>
      <ol className="qc-report-samples" aria-label="Reported samples">
        {report.samples.map((sample) => (
          <li key={sample.percentage}>
            <span className="mono">{sample.percentage}%</span>
            <VerdictLabel verdict={sample.simulatedFaceCheck} />
            <strong>{decisionLabels[sample.humanReview.decision]}</strong>
            {sample.humanReview.note && <p>{sample.humanReview.note}</p>}
          </li>
        ))}
      </ol>
      <p className="qc-note">Three sampled frames describe only those points in the clip.</p>
    </section>
  )
}

export default function VisualDataLab() {
  const [selected, selectFrame] = useState(0)
  const [overlays, setOverlays] = useState(true)
  const [reviews, setReviews] = useState<Review[]>(() => samples.map(() => ({ decision: null, note: '' })))
  const [report, setReport] = useState<Report | null>(null)
  const sample = samples[selected]
  const verdict = faceVerdict(sample)
  const review = reviews[selected]
  const reviewed = reviews.filter((item) => item.decision !== null).length

  function updateReview(update: Partial<Review>) {
    setReviews((previous) => previous.map((entry, index) => index === selected ? { ...entry, ...update } : entry))
    setReport(null)
  }

  return (
    <section id="frame-lab" className="qc-lab" aria-labelledby="qc-title">
      <header className="qc-heading">
        <div>
          <h2 id="qc-title">3D Frame Lab</h2>
          <p className="qc-description">Inspect three points in a clip and record how you would handle each frame.</p>
        </div>
        <p className="qc-simulation mono"><span aria-hidden="true" /> Synthetic clip · Simulated detections</p>
      </header>
      <div className="qc-console">
        <div className="qc-stage">
          <div className="qc-toolbar">
            <span className="mono">{clip.id} / {clip.title}</span>
            <label className="qc-toggle mono">
              <input type="checkbox" checked={overlays} onChange={(event) => setOverlays(event.currentTarget.checked)} />
              Detection boxes
            </label>
          </div>
          <FrameViewer selected={selected} overlays={overlays} onSelect={selectFrame} />
          <div className="qc-samples" role="group" aria-label="Sample frames">
            {samples.map((entry, index) => (
              <button type="button" key={entry.percent} aria-pressed={selected === index} onClick={() => selectFrame(index)} aria-label={`Sample ${entry.percent}%, ${sampleTime(entry)}`}>
                <span className="qc-sample-percent mono">{entry.percent}%</span>
                <span>{sampleTime(entry)}</span>
                <span className={`qc-indicator ${reviews[index].decision ? 'qc-reviewed' : ''}`} aria-hidden="true">{reviews[index].decision ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="qc-inspector">
          <div className="qc-inspect">
            <p className="qc-kicker mono">SAMPLE {String(selected + 1).padStart(2, '0')} / {sampleTime(sample)}</p>
            <h3>{sample.description}</h3>
            <dl className="qc-metrics">
              <div><dt>Largest face box</dt><dd>{sample.face ? `${sample.face.width} × ${sample.face.height} px` : 'No detection'}</dd></div>
              <div><dt>Minimum width and height</dt><dd>Each ≥ {faceMinimum} px</dd></div>
              <div><dt>Simulated face check</dt><dd><VerdictLabel verdict={verdict} /></dd></div>
            </dl>
            {verdict === 'hold' && <p className="qc-note">The fixture contains an occluder at this timestamp. Inspect the image before deciding.</p>}
          </div>
          <div className="qc-review">
            <fieldset>
              <legend>Human review</legend>
              <div className="qc-decisions">
                {(Object.entries(decisionLabels) as [Decision, string][]).map(([decision, label]) => (
                  <label key={decision}>
                    <input type="radio" name="qc-decision" value={decision} checked={review.decision === decision} onChange={() => updateReview({ decision })} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="qc-note-field">
              <span>Reviewer note <small>(optional)</small></span>
              <textarea value={review.note} onChange={(event) => updateReview({ note: event.currentTarget.value })} maxLength={500} rows={2} placeholder="Record what informed your decision…" />
            </label>
          </div>
        </div>
      </div>

      <details className="qc-rules">
        <summary>Clip specifications and rule thresholds</summary>
        <p className="qc-note">The fixture declares its metadata. The browser compares those values and the scripted box coordinates with the repository rules.</p>
        <table>
          <thead><tr><th scope="col">Check</th><th scope="col">Fixture value</th><th scope="col">Requirement</th><th scope="col">Result</th></tr></thead>
          <tbody>{specRules.map((rule) => <tr key={rule.name}><th scope="row">{rule.name}</th><td>{rule.value}</td><td>{rule.requirement}</td><td><VerdictLabel verdict={rule.passes ? 'pass' : 'fail'} /></td></tr>)}</tbody>
        </table>
        <p className="qc-note">For face sampling, any undersized box fails the clip check. With no undersized box, a missing detection calls for review. <a href={source}>Read the repository rules ↗</a></p>
      </details>

      <div className="qc-report-bar">
        <div>
          <p className="mono" role="status">{report ? 'Simulated report ready' : `${reviewed} / ${samples.length} samples reviewed`}</p>
          <p className="qc-note">{reviewed === samples.length ? 'The report records both the rule results and your decisions.' : 'Choose a disposition for each frame to generate a report.'}</p>
        </div>
        <button type="button" className="qc-action qc-primary mono" disabled={reviewed !== samples.length} onClick={() => setReport(buildReport(reviews))}>
          Generate simulated report <span aria-hidden="true">↘</span>
        </button>
      </div>
      {report && <ReportPanel report={report} />}
    </section>
  )
}
