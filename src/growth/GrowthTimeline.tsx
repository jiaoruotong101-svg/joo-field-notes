import { sitePath } from '../sitePaths'
import { readHomeState, rememberGrowth } from '../homeState'
import { useState } from 'react'
import { projects } from '../content/projects'
import './growth.css'

const projectLinks = projects.filter(({ slug }) => slug !== 'huahua')
  .map(({ name, slug }) => ({ label: name, href: `/projects/${slug}` }))

const nodes = [
  {
    id: 'management', label: 'Management science', x: 91, y: 194, markerLabel: null,
    description: 'I came to AI through management science. It shaped the questions I bring to technical work, including how people experience a decision and how a process can be made easier to inspect.',
    links: [{ label: 'Read the research chapter', href: '#research' }],
  },
  {
    id: 'research', label: 'Research', x: 266, y: 85, markerLabel: 'Research',
    description: 'I use H5 interaction design to explore how disclosing an algorithm’s reasoning before, during or after a decision might change how people perceive its fairness.',
    links: [{ label: 'Try the disclosure experiment', href: '#disclosure-experiment' }],
  },
  {
    id: 'engineering', label: 'AI & engineering', x: 242, y: 144, markerLabel: null,
    description: 'My engineering practice grew around concrete workflows. In multimodal video caption work, I dealt with annotation standards, automated checks, human review and delivery verification.',
    links: [{ label: 'Inspect the caption track', href: '#caption-inspection' }],
  },
  {
    id: 'projects', label: 'Project work', x: 301, y: 201, markerLabel: 'Project work',
    description: 'Visual Data QC makes visual triage inspectable. Resume Copilot lets a person review suggested fields before filling a form. URL Crawler collects and deduplicates links across discovery paths. JDDs Skills records reusable workflows.',
    links: projectLinks,
  },
  {
    id: 'huahua', label: 'Huahua 花花', x: 384, y: 94, markerLabel: 'Huahua',
    description: 'Huahua turns task states into small expressions and gestures. I explored how a character could feel responsive through an animated sprite sheet and sixteen directions of gaze.',
    links: [{ label: 'Open Huahua Playground', href: '/projects/huahua' }],
  },
]

const plot = { width: 480, height: 296 }

function coordinates(node: (typeof nodes)[number]) {
  return { left: `${node.x / plot.width * 100}%`, top: `${node.y / plot.height * 100}%` }
}

export default function GrowthTimeline() {
  const [active, setActive] = useState(() => nodes.find(node => node.id === readHomeState()?.growthNode) || nodes[0])
  return (
    <>
      <header className="growth-heading">
        <h3 id="growth-title">Paths I’ve followed.</h3>
        <p>Select a node to explore the experiences and experiments behind it.</p>
      </header>
      <div className="growth-board">
        <div className="growth-map" role="group" aria-label="Growth timeline nodes">
          <img src={sitePath("/illustrations/field-constellation.svg")} alt="" width={480} height={296} loading="lazy" decoding="async" />
          <span className="growth-aura" aria-hidden="true" style={coordinates(active)} />
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`growth-node growth-node-${node.id}`}
              style={coordinates(node)}
              aria-label={node.label}
              aria-pressed={active.id === node.id}
              aria-controls="growth-note"
              onClick={() => { setActive(node); rememberGrowth(node.id) }}
            >
              <span className="growth-dot" aria-hidden="true" />
              {node.markerLabel && <span className="growth-map-label mono" aria-hidden="true">{node.markerLabel}</span>}
            </button>
          ))}
        </div>
        <div className="growth-note" id="growth-note" aria-live="polite" aria-atomic="true">
          <div key={active.id} className="growth-copy">
            <h4>{active.label}</h4>
            <p>{active.description}</p>
            <ul>
              {active.links.map((link) => (
                <li key={link.href}><a href={sitePath(link.href)}>{link.label}<span aria-hidden="true">{link.href.startsWith('#') ? '↗' : '→'}</span></a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
