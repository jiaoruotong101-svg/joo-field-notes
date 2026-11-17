import { useRef, useState, type FormEvent } from 'react'
import {
  canSaveFeedback, choices, conditions, dimensions, explanationVisible, newRun, nextStage,
  questions, scenario, stages, type Condition, type Dimension, type Rating, type Run,
} from './disclosure'
import './disclosure.css'

const conditionIds = Object.keys(conditions) as Condition[]
const advanceLabels = ['Start review', 'View decision', 'Continue to feedback'] as const

export default function DisclosureExperiment() {
  const [condition, setCondition] = useState<Condition>('before')
  const [runs, setRuns] = useState<Record<Condition, Run>>(() => ({
    before: newRun(), during: newRun(), after: newRun(),
  }))
  const explanation = useRef<HTMLHeadingElement>(null)
  const selector = useRef<HTMLFieldSetElement>(null)
  const run = runs[condition]
  const showExplanation = explanationVisible(condition, run.stage)
  const ready = canSaveFeedback(run)

  function updateRun(update: (old: Run) => Run) {
    setRuns((previous) => ({ ...previous, [condition]: update(previous[condition]) }))
  }

  function rate(dimension: Dimension, value: Rating) {
    updateRun((old) => ({ ...old, ratings: { ...old.ratings, [dimension]: value }, saved: false }))
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateRun((old) => canSaveFeedback(old) ? { ...old, saved: true } : old)
  }

  return (
    <>
      <header className="dis-heading">
        <div>
          <h2 id="disclosure-title">When the reason arrives.</h2>
          <p>Try the same booking decision with the explanation delivered at different moments.</p>
        </div>
        <p className="dis-sim mono"><span /> Simulated experiment</p>
      </header>
      <fieldset className="dis-conditions" ref={selector}>
        <legend className="mono">Disclosure condition</legend>
        {conditionIds.map((id) => (
          <label key={id}>
            <input type="radio" name="disclosure-condition" value={id} checked={id === condition} onChange={() => setCondition(id)} />
            <span>{conditions[id].label}</span>
          </label>
        ))}
      </fieldset>

      <div className="dis-console">
        <ol className="dis-track" aria-label="Decision stages">
          {stages.map((stage, index) => (
            <li key={stage} aria-current={index === run.stage ? 'step' : undefined} data-passed={index < run.stage}>
              <span className="dis-step mono" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{stage}
            </li>
          ))}
        </ol>
        <div className="dis-columns">
          <section className="dis-scenario" aria-labelledby="dis-case">
            <div>
              <p className="dis-caption mono">Fictional scenario</p>
              <h3 id="dis-case">{scenario.title}</h3>
              <p>{scenario.request}</p>
            </div>

            <div className="dis-event" aria-live="polite">
              <div key={run.stage < 2 ? run.stage : 'decision'} className="dis-appear">
                {run.stage === 0 && <><p className="dis-caption mono">Request</p><p>Ready for review.</p></>}
                {run.stage === 1 && <><p className="dis-caption mono">Review in progress</p><p>{scenario.review}</p></>}
                {run.stage >= 2 && <><p className="dis-caption mono">Decision</p><strong>{scenario.outcome}</strong><p>{scenario.next}</p></>}
              </div>
            </div>

          </section>

          <section className="dis-explanation" aria-labelledby="dis-explanation-title" aria-live="polite">
            <p className="dis-caption mono">Information available to you</p>
            <h3 id="dis-explanation-title" ref={explanation} tabIndex={-1}>Decision explanation</h3>
            {showExplanation ? (
              <div key={condition} className="dis-appear">
                <p className="dis-reveal mono">First shown {conditions[condition].label.toLowerCase()}</p>
                <p className="dis-reason">{scenario.explanation}</p>
              </div>
            ) : <p className="dis-wait">Awaiting disclosure.</p>}
          </section>
        </div>
        {run.stage !== 3 && (
          <div className="dis-actions dis-run-actions">
            <button type="button" className="dis-button dis-primary mono" onClick={() => {
              const stage = nextStage(run.stage)
              updateRun((old) => ({ ...old, stage }))
              if (stage === 3 || stage === conditions[condition].revealAt) {
                requestAnimationFrame(() => explanation.current?.focus())
              }
            }}>{advanceLabels[run.stage]} <span aria-hidden="true">→</span></button>
          </div>
        )}
      </div>

      {run.stage === 3 && (
        <form className="dis-feedback dis-appear" onSubmit={save}>
          <div className="dis-feedback-heading">
            <div>
              <h3>How fair did it feel?</h3>
              <p>Rate this condition. Ratings stay on this page until you reload.</p>
            </div>
            <p className="dis-scale mono">1 Strongly disagree · 5 Strongly agree</p>
          </div>
          <div className="dis-questions">
            {dimensions.map((dimension) => (
              <fieldset className="dis-question" key={dimension}>
                <legend>{questions[dimension].label}</legend>
                <p>{questions[dimension].prompt}</p>
                <div>
                  {choices.map(({ value, label }) => (
                    <label key={value}>
                      <input type="radio" name={`fairness-${dimension}`} value={value} aria-label={`${value} · ${label}`}
                        checked={run.ratings[dimension] === value} onChange={() => rate(dimension, value)} />
                      <span aria-hidden="true">{value}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="dis-actions dis-feedback-actions">
            <p className="mono" role="status">{run.saved ? 'Feedback saved for this condition.' : 'Choose one response for each question.'}</p>
            <button type="submit" className="dis-button dis-primary mono" disabled={!ready || run.saved}>Save feedback</button>
          </div>
        </form>
      )}

      <div className="dis-footer">
        <button type="button" className="dis-reset" disabled={run.stage === 0} onClick={() => {
          updateRun(newRun)
          selector.current?.querySelector<HTMLInputElement>('input:checked')?.focus()
        }}>
          Restart this condition
        </button>
      </div>
    </>
  )
}
