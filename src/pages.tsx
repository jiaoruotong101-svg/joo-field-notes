import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Signal } from './components/Signal'
import { attachChapterSnap } from './components/chapterSnap'
import { ViewportDemo } from './components/ViewportDemo'
import { profile, projects } from './content/projects'

const DisclosureExperiment = lazy(() => import('./research/DisclosureExperiment'))
const CaptionInspection = lazy(() => import('./caption/CaptionInspection'))
const GrowthTimeline = lazy(() => import('./growth/GrowthTimeline'))
const VisualDataLab = lazy(() => import('./lab/VisualDataLab'))
const ResumeDemo = lazy(() => import('./resume/ResumeDemo'))
const CrawlerDemo = lazy(() => import('./crawler/CrawlerDemo'))
const HuahuaPlayground = lazy(() => import('./huahua/HuahuaPlayground'))

function Header({ home }: { home: boolean }) {
  const root = home ? '' : '/'
  return (
    <header className="masthead wrap">
      <a className="brand mono" href={home ? '#top' : '/'}><span className="brand-mark" aria-hidden="true">✳</span> JOO <span className="brand-divider">/</span> FIELD NOTES</a>
      <nav aria-label="Main navigation" className="mono">
        <a href={`${root}#work`}>Work</a>
        <a href={`${root}#research`}>Research</a>
        <a href={`${root}#connection`}>Contact <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  )
}

export function Home() {
  useEffect(attachChapterSnap, [])

  useLayoutEffect(() => {
    const section = document.getElementById(window.location.hash.slice(1))
    section?.scrollIntoView({ behavior: 'instant' })
  }, [])

  return (
    <>
      <a className="skip" href="#main">Skip to main content</a>
      <div className="opening" id="top">
        <Header home />
        <main id="main" tabIndex={-1}>
          <section className="hero wrap" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="chapter mono"><span /> 00 / THE SIGNAL</p>
              <h1 id="hero-title"><span>JOO <i>/</i></span><span>FIELD NOTES</span></h1>
              <p className="intro">Code, experiments,<br /> and a little curiosity.</p>
              <p className="description">An interactive archive of things I build, study &amp; imagine.</p>
              <a className="explore mono" href="#work"><span aria-hidden="true">↓</span> Explore the archive</a>
            </div>
            <Signal />
          </section>
          <div className="hero-footer wrap mono">
            <span><span className="footer-cross" aria-hidden="true">+</span> MAKE THE INVISIBLE VISIBLE.</span>
            <a href="#work">SCROLL TO EXPLORE <b aria-hidden="true">↓</b></a>
          </div>
          <section className="work chapter-section" id="work" tabIndex={-1} aria-labelledby="work-title">
            <div className="wrap">
              <div className="section-head">
                <p className="chapter mono"><span /> 01 / THE BUILDER</p>
                <h2 id="work-title">Selected work.</h2>
              </div>
              <ol className="project-index">
                {projects.map((project) => (
                  <li key={project.slug}>
                    <a href={`/projects/${project.slug}`}>
                      <span className="mono project-number">{project.number}</span>
                      <span className="project-name">{project.name}</span>
                      <span className="project-summary">{project.summary}</span>
                      <span className="mono project-label">{project.label}</span>
                      <span className="project-arrow" aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </section>
          <section className="essay chapter-section wrap" id="research" tabIndex={-1} aria-labelledby="research-title">
            <p className="chapter mono"><span /> 02 / THE EXPLORER</p>
            <div className="essay-copy">
              <h2 id="research-title">When does an explanation change how fair a decision feels?</h2>
              <p>My research looks at algorithmic disclosure before, during and after a decision. I use H5 interaction design to study how timing might shape perceptions of procedural, interactional and outcome fairness, as well as attitudes and behavior.</p>
              <a className="text-link" href="#disclosure-experiment">Try the disclosure experiment <span aria-hidden="true">↓</span></a>
              <details><summary>Research and case work</summary><p>CMAU annual conference paper acceptance, a smart elderly care case study, and an information resource management case competition.</p></details>
              <details><summary>Current research interests</summary><p>Multimodal AI, digital humans, speech-driven gesture and dynamic point clouds.</p></details>
            </div>
            <img className="essay-illustration" src="/illustrations/disclosure-timing.svg" width={480} height={296} loading="lazy" decoding="async" alt="Three diagrams show algorithmic disclosure before, during and after the same decision window." />
          </section>
          <section className="disclosure wrap" id="disclosure-experiment" tabIndex={-1} aria-labelledby="disclosure-title">
            <ViewportDemo anchor="disclosure-experiment" label="Disclosure timing experiment"><DisclosureExperiment /></ViewportDemo>
          </section>
          <section className="essay chapter-section wrap" id="practice" tabIndex={-1} aria-labelledby="practice-title">
            <p className="chapter mono"><span /> 03 / THE DOER</p>
            <div className="essay-copy">
              <h2 id="practice-title">Where video annotations break.</h2>
              <p>My internship work covered source screening, annotation standards, automated checks, review and delivery verification for multimodal video captions. A broken timestamp, misassigned person ID or inconsistent table can make a caption unreliable downstream.</p>
              <p>The inspection workflow looks at timing, entity labels, duplicates and consistency across tables before delivery.</p>
              <a className="text-link" href="#caption-inspection">Try the caption inspection <span aria-hidden="true">↓</span></a>
            </div>
            <img className="essay-illustration" src="/illustrations/caption-timeline.svg" width={480} height={296} loading="lazy" decoding="async" alt="A sample video timeline flags the uncovered second between two caption segments." />
          </section>
          <section className="caption-inspection wrap" id="caption-inspection" tabIndex={-1} aria-labelledby="caption-inspection-title">
            <ViewportDemo anchor="caption-inspection" label="Caption inspection"><CaptionInspection /></ViewportDemo>
          </section>
          <section className="human-chapter chapter-section wrap" id="human" tabIndex={-1} aria-labelledby="human-title">
            <div className="essay human-intro">
              <p className="chapter mono"><span /> 04 / THE HUMAN</p>
              <div className="essay-copy">
                <h2 id="human-title">From data to intelligence.<br />From logic to imagination.</h2>
                <p>I came to AI through management science. That route still shapes what I build, from making an automated decision easier to inspect to getting the timing of a tiny desktop character’s gaze right.</p>
              </div>
            </div>
            <section className="growth-timeline" id="growth-timeline" tabIndex={-1} aria-labelledby="growth-title">
              <ViewportDemo anchor="growth-timeline" label="Personal timeline"><GrowthTimeline /></ViewportDemo>
            </section>
          </section>
          <section className="connection chapter-section" id="connection" tabIndex={-1} aria-labelledby="connection-title">
            <div className="wrap">
              <p className="chapter mono"><span /> 05 / THE CONNECTION</p>
              <h2 id="connection-title">Let’s compare notes.</h2>
              <p>JOO · AI, data quality and visual computing.</p>
              <a className="explore mono" href={profile}><span aria-hidden="true">↗</span> Find me on GitHub</a>
              <div className="connection-orbit" aria-hidden="true">✳</div>
            </div>
          </section>
        </main>
        <footer className="site-footer wrap mono"><span>JOO / FIELD NOTES</span><a href="#top">Back to the signal ↑</a></footer>
      </div>
    </>
  )
}

export function ProjectPage({ project }: { project: (typeof projects)[number] | undefined }) {
  const isVisualData = project?.slug === 'visual-data-qc'
  const isResume = project?.slug === 'resume-copilot'
  const isCrawler = project?.slug === 'url-crawler'
  const isHuahua = project?.slug === 'huahua'

  return (
    <>
      <a className="skip" href="#project">Skip to project</a>
      <Header home={false} />
      <main id="project" tabIndex={-1} className={['project-page', 'wrap', isVisualData && 'project-page-qc', isResume && 'project-page-resume', isCrawler && 'project-page-crawler', isHuahua && 'project-page-huahua'].filter(Boolean).join(' ')}>
        <a className="back mono" href="/#work">← Selected work</a>
        {project ? (
          <article>
            <p className="chapter mono"><span /> {project.number} / {project.label}</p>
            <h1>{project.name}</h1>
            <p className="project-lead">{project.summary}</p>
            {isVisualData && (
              <Suspense fallback={<p role="status">Loading frame lab…</p>}>
                <VisualDataLab />
              </Suspense>
            )}
            {isResume && (
              <Suspense fallback={<p role="status">Loading résumé demo…</p>}><ResumeDemo /></Suspense>
            )}
            {isCrawler && (
              <Suspense fallback={<p role="status">Loading star map…</p>}><CrawlerDemo /></Suspense>
            )}
            {isHuahua && (
              <Suspense fallback={<p role="status">Loading Playground…</p>}><HuahuaPlayground /></Suspense>
            )}
            <ol className="pipeline" aria-label="Workflow">
              {project.stages.map((stage, i) => <li key={stage}><span className="mono">{String(i + 1).padStart(2, '0')}</span>{stage}</li>)}
            </ol>
            <div className="project-story">
              <section><h2>The problem</h2><p>{project.context}</p></section>
              <section><h2>Approach</h2><p>{project.implementation}</p></section>
              <section><h2>Results and limits</h2><p>{project.limits}</p></section>
            </div>
            <a className="explore mono" href={project.repository}><span aria-hidden="true">↗</span> View source on GitHub</a>
          </article>
        ) : <h1>Page not found.</h1>}
      </main>
    </>
  )
}
