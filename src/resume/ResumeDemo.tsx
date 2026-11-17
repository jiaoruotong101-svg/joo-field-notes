import { useRef, useState } from 'react'
import { candidate, getFillPlan, initialDrafts, mappings, type Draft, type FieldId } from './fixture'
import './resume.css'

export default function ResumeDemo() {
  const [selected, select] = useState<FieldId>('name')
  const [drafts, setDrafts] = useState(initialDrafts)
  const [filled, setFilled] = useState<Partial<Record<FieldId, string>>>({})
  const [status, setStatus] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const mapping = mappings.find((item) => item.id === selected)!
  const draft = drafts[selected]
  const plan = getFillPlan(drafts)
  const count = Object.keys(filled).length

  function updateDraft(update: Partial<Draft>) {
    setDrafts((previous) => ({ ...previous, [selected]: { ...previous[selected], ...update } }))
    setStatus('')
  }

  function confirmFill() {
    setFilled((previous) => ({ ...previous, ...Object.fromEntries(plan.map(({ id, value }) => [id, value])) }))
    dialog.current?.close()
    setStatus(`${plan.length} ${plan.length === 1 ? 'field' : 'fields'} filled in the mock form.`)
  }

  function resetDemo() {
    setDrafts(initialDrafts())
    setFilled({})
    select('name')
    setStatus('Demo reset. The mock form is empty.')
  }

  return (
    <section className="rc-demo" aria-labelledby="rc-title">
      <header className="rc-heading">
        <div>
          <h2 id="rc-title">Review before filling.</h2>
          <p>Trace suggested values to the résumé, edit them, and decide what goes into the form.</p>
        </div>
        <span className="rc-simulation mono">Fictional applicant · Local simulation</span>
      </header>

      <div className="rc-workbench">
        <section className="rc-source" aria-labelledby="rc-source-title">
          <h3 id="rc-source-title" className="rc-panel-title mono">Source résumé</h3>
          <div className="rc-resume-sheet">
            <p className={`rc-candidate ${mapping.source === 'Name' ? 'rc-evidence' : ''}`}>{candidate.name}</p>
            <dl>
              <div className={mapping.source === 'Contact' ? 'rc-evidence' : ''}><dt>Contact</dt><dd>{candidate.email}</dd></div>
              <div className={mapping.source === 'Location' ? 'rc-evidence' : ''}><dt>Location</dt><dd>{candidate.location}</dd></div>
              <div className={mapping.source === 'Experience' ? 'rc-evidence' : ''}><dt>Experience</dt><dd>{candidate.role}</dd></div>
              <div className={mapping.source === 'Project note' ? 'rc-evidence' : ''}><dt>Project note</dt><dd>{candidate.project}</dd></div>
            </dl>
          </div>
        </section>

        <section className="rc-mapping" aria-labelledby="rc-mapping-title">
          <h3 id="rc-mapping-title" className="rc-panel-title mono">Field matches</h3>
          <div className="rc-field-list" role="group" aria-label="Choose a field to inspect">
            {mappings.map((item) => (
              <button type="button" key={item.id} aria-pressed={item.id === selected} onClick={() => select(item.id)}>
                <span>{item.label}</span>
                <span className={`rc-match mono ${item.match === 'Check recency' || item.match === 'Missing' ? 'rc-match-review' : ''}`}>{item.match}</span>
              </button>
            ))}
          </div>
          <div className="rc-inspect">
            <h4>{mapping.label}</h4>
            {mapping.evidence && <blockquote>{mapping.evidence}</blockquote>}
            <p>{mapping.reason}</p>
            <label className="rc-value-label" htmlFor="rc-suggestion">Suggested value</label>
            <textarea id="rc-suggestion" value={draft.value} maxLength={500} rows={selected === 'project' ? 3 : 2}
              onChange={(event) => updateDraft({ value: event.currentTarget.value })} />
            <label className="rc-check">
              <input type="checkbox" checked={draft.included && Boolean(draft.value.trim())} disabled={!draft.value.trim()}
                onChange={(event) => updateDraft({ included: event.currentTarget.checked })} />
              Include in next fill
            </label>
          </div>
          <div className="rc-actions">
            <p className="rc-status mono" role="status">{status || `${plan.length} of ${mappings.length} fields selected for preview.`}</p>
            <div>
              <button type="button" className="rc-button" onClick={resetDemo}>Reset demo</button>
              <button type="button" className="rc-button rc-primary" disabled={!plan.length} onClick={() => dialog.current?.showModal()}>Preview selected fields <span aria-hidden="true">↘</span></button>
            </div>
          </div>
        </section>

        <section className="rc-form" aria-labelledby="rc-form-title">
          <h3 id="rc-form-title" className="rc-panel-title mono">Mock application</h3>
          <div className="rc-form-body">
            <h4>Computer Vision Intern</h4>
            <p className="rc-form-count mono">{count} / {mappings.length} fields filled</p>
            {mappings.map(({ id, label }) => (
              <label className={`rc-output ${id === selected ? 'rc-output-current' : ''}`} key={id}>
                <span>{label}</span>
                {id === 'project'
                  ? <textarea value={filled[id] ?? ''} readOnly rows={3} />
                  : <input value={filled[id] ?? ''} readOnly />}
              </label>
            ))}
          </div>
        </section>
      </div>

      <dialog ref={dialog} className="rc-dialog" aria-labelledby="rc-confirm-title">
        <h3 id="rc-confirm-title">Confirm mock fill</h3>
        <p>These values will be copied to the form on this page.</p>
        <dl>{plan.map((item) => <div key={item.id}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        <div className="rc-dialog-actions">
          <button type="button" className="rc-button" autoFocus onClick={() => dialog.current?.close()}>Cancel</button>
          <button type="button" className="rc-button rc-primary" onClick={confirmFill}>Confirm and fill {plan.length}</button>
        </div>
      </dialog>
    </section>
  )
}
