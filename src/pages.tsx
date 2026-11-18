import { RememberedDetails } from './components/RememberedDetails'
import { ProjectIllustration } from './components/ProjectIllustration'
import { Fragment, lazy, Suspense, useEffect, useLayoutEffect, type CSSProperties } from 'react'
import { FieldLine, ScrollTrace } from './components/FieldLine'
import { Signal } from './components/Signal'
import { ChapterColors } from './components/ChapterColors'
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
      <ScrollTrace />
      <a className="brand mono" href={home ? '#top' : '/'}><span className="brand-mark" aria-hidden="true">✳</span> JOO <span className="brand-divider">/</span> FIELD NOTES</a>
      <nav aria-label="Main navigation" className="mono">
        <a href={`${root}#work`}>Work</a>
        <a href={`${root}#research`}>Research</a>
        <a href={`${root}#connection`}>Contact <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  )
}

const chapters = [
  { number: '01', label: 'Work', id: 'work' },
  { number: '02', label: 'Research', id: 'research' },
  { number: '03', label: 'Practice', id: 'practice' },
  { number: '04', label: 'Human', id: 'human' },
  { number: '05', label: 'Contact', id: 'connection' },
]

// Splits a heading into per-character spans so each letter can hop in on its own.
function HopTitle({ id, lines }: { id?: string; lines: string[] }) {
  let i = 0
  return (
    <h2 id={id}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(' ').map((word, wi) => (
            <Fragment key={wi}>
              {wi > 0 && ' '}
              <span className="hop-word">
                {Array.from(word).map((ch, ci) => (
                  <span key={ci} className="hop-char" style={{ '--i': i++ } as CSSProperties}>{ch}</span>
                ))}
              </span>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </h2>
  )
}

function ChapterHead({ index, label, className = '' }: { index: string; label: string; className?: string }) {
  return (
    <div className={`essay-head ${className}`.trim()}>
      <p className="chapter mono"><span /> {index} / {label}</p>
      <FieldLine tone="rule" pull={16} reveal="view" className="chapter-rule" />
    </div>
  )
}

export function Home() {
  useEffect(attachChapterSnap, [])

  useLayoutEffect(() => {
    const section = document.getElementById(window.location.hash.slice(1))
    section?.scrollIntoView({ behavior: 'instant' })
  }, [])

  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.hero-index a[data-section]'))
    if (!links.length) return
    function update() {
      const probe = innerHeight * 0.34
      let current = ''
      for (const link of links) {
        const target = link.dataset.section
        if (!target) continue
        const el = document.getElementById(target)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= probe && rect.bottom > probe) {
          current = target
          break
        }
      }
      if (!current && scrollY + innerHeight >= document.documentElement.scrollHeight - 2) {
        current = links[links.length - 1].dataset.section ?? ''
      }
      links.forEach((link) => link.classList.toggle('active', link.dataset.section === current))
    }
    update()
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    return () => {
      removeEventListener('scroll', update)
      removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.chapter-section'))
    if (!sections.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('in')
        io.unobserve(entry.target)
      })
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' })
    sections.forEach((section) => io.observe(section))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <ChapterColors />
      <a className="skip" href="#main">Skip to main content</a>
      <div className="opening" id="top">
        <Header home />
        <main id="main" tabIndex={-1}>
          <section className="hero wrap" aria-labelledby="hero-title">
            <div className="hero-field" aria-hidden="true">
              <FieldLine tone="ice" pull={22} reveal="load" className="hero-field-upper" />
              <FieldLine tone="coral" pull={18} reveal="load" className="hero-field-lower" />
            </div>
            <div className="hero-copy">
              <div className="hero-statement">
                <p className="chapter mono"><span /> 00 / THE SIGNAL</p>
                <h1 id="hero-title"><span>JOO <i>/</i></span><span>FIELD NOTES</span></h1>
                <p className="intro">Code, experiments,<br /> and a little curiosity.</p>
                <p className="description">An interactive archive of things I build, study &amp; imagine.</p>
                <a className="explore mono" href="#work"><span aria-hidden="true">↓</span> Explore the archive</a>
              </div>
              <nav className="hero-index mono" aria-label="Archive chapters">
                {chapters.map((chapter) => (
                  <a key={chapter.id} href={`#${chapter.id}`} data-section={chapter.id}>
                    <b aria-hidden="true">{chapter.number}</b>
                    {chapter.label}
                  </a>
                ))}
              </nav>
            </div>
            <Signal />
          </section>
          <FieldLine tone="rule" pull={10} reveal="load" className="hero-rule wrap" />
          <div className="hero-footer wrap mono">
            <span><span className="footer-cross" aria-hidden="true">+</span> MAKE THE INVISIBLE VISIBLE.</span>
            <a href="#work">SCROLL TO EXPLORE <b aria-hidden="true">↓</b></a>
          </div>
          <section className="work chapter-section" id="work" tabIndex={-1} aria-labelledby="work-title">
            <span className="chapter-halo" aria-hidden="true" />
            <div className="wrap">
              <div className="section-head">
                <p className="chapter mono"><span /> 01 / THE BUILDER</p>
                <HopTitle id="work-title" lines={['Selected work.']} />
              </div>
              <FieldLine tone="rule" pull={18} reveal="view" className="chapter-rule chapter-rule-lead" />
              <ol className="project-index">
                {projects.map((project) => (
                  <li key={project.slug} className="project-row">
                    <a href={`/projects/${project.slug}`}>
                      <span className="mono project-number">{project.number}</span>
                      <span className="project-name">{project.name}</span>
                      <span className="project-summary">{project.summary}</span>
                      <span className="mono project-label">{project.label}</span>
                      <span className="project-arrow" aria-hidden="true">↗</span>
                    </a>
                    <FieldLine tone="coral" pull={16} reveal="load" className="project-line" />
                  </li>
                ))}
              </ol>
              <FieldLine tone="coral" pull={22} reveal="view" className="chapter-rule chapter-rule-tail" />
            </div>
          </section>
          <section className="essay chapter-section wrap" id="research" tabIndex={-1} aria-labelledby="research-title">
            <span className="chapter-halo" aria-hidden="true" />
            <ChapterHead index="02" label="THE EXPLORER" />
            <div className="essay-body">
              <div className="essay-copy">
                <HopTitle id="research-title" lines={['When does an explanation change how fair a decision feels?']} />
                <p>My research looks at algorithmic disclosure before, during and after a decision. I use H5 interaction design to study how timing might shape perceptions of procedural, interactional and outcome fairness, as well as attitudes and behavior.</p>
                <a className="text-link" href="#disclosure-experiment">Try the disclosure experiment <span aria-hidden="true">↓</span></a>
                <RememberedDetails id="research-work"><summary>Research and case work</summary><p>CMAU annual conference paper acceptance, a smart elderly care case study, and an information resource management case competition.</p></RememberedDetails>
                <RememberedDetails id="research-interests"><summary>Current research interests</summary><p>Multimodal AI, digital humans, speech-driven gesture and dynamic point clouds.</p></RememberedDetails>
              </div>
              <img className="essay-illustration" src="/illustrations/disclosure-timing.svg" width={480} height={296} loading="lazy" decoding="async" alt="Three diagrams show algorithmic disclosure before, during and after the same decision window." />
            </div>
          </section>
          <section className="disclosure wrap" id="disclosure-experiment" tabIndex={-1} aria-labelledby="disclosure-title">
            <ViewportDemo anchor="disclosure-experiment" label="Disclosure timing experiment"><DisclosureExperiment /></ViewportDemo>
          </section>
          <section className="essay chapter-section wrap" id="practice" tabIndex={-1} aria-labelledby="practice-title">
            <span className="chapter-halo" aria-hidden="true" />
            <ChapterHead index="03" label="THE DOER" />
            <div className="essay-body">
              <div className="essay-copy">
                <HopTitle id="practice-title" lines={['Where video annotations break.']} />
                <p>My internship work covered source screening, annotation standards, automated checks, review and delivery verification for multimodal video captions. A broken timestamp, misassigned person ID or inconsistent table can make a caption unreliable downstream.</p>
                <p>The inspection workflow looks at timing, entity labels, duplicates and consistency across tables before delivery.</p>
                <a className="text-link" href="#caption-inspection">Try the caption inspection <span aria-hidden="true">↓</span></a>
              </div>
              <img className="essay-illustration" src="/illustrations/caption-timeline.svg" width={480} height={296} loading="lazy" decoding="async" alt="A sample video timeline flags the uncovered second between two caption segments." />
            </div>
          </section>
          <section className="caption-inspection wrap" id="caption-inspection" tabIndex={-1} aria-labelledby="caption-inspection-title">
            <ViewportDemo anchor="caption-inspection" label="Caption inspection"><CaptionInspection /></ViewportDemo>
          </section>
          <section className="human-chapter chapter-section wrap" id="human" tabIndex={-1} aria-labelledby="human-title">
            <span className="chapter-halo" aria-hidden="true" />
            <div className="essay human-intro">
              <ChapterHead index="04" label="THE HUMAN" />
              <div className="essay-copy">
                <HopTitle id="human-title" lines={['From data to intelligence.', 'From logic to imagination.']} />
                <p>I came to AI through management science. That route still shapes what I build, from making an automated decision easier to inspect to getting the timing of a tiny desktop character’s gaze right.</p>
              </div>
            </div>
            <section className="growth-timeline" id="growth-timeline" tabIndex={-1} aria-labelledby="growth-title">
              <ViewportDemo anchor="growth-timeline" label="Personal timeline"><GrowthTimeline /></ViewportDemo>
            </section>
            <FieldLine tone="rule" pull={22} reveal="view" className="chapter-rule chapter-rule-tail" />
          </section>
          <section className="connection chapter-section" id="connection" tabIndex={-1} aria-labelledby="connection-title">
            <span className="chapter-halo" aria-hidden="true" />
            <div className="wrap">
              <div className="connection-inner">
                <ChapterHead index="05" label="THE CONNECTION" />
                <HopTitle id="connection-title" lines={['Let’s compare notes.']} />
                <p>JOO · AI, data quality and visual computing.</p>
                <a className="explore mono" href={profile}><span aria-hidden="true">↗</span> Find me on GitHub</a>
              </div>
              <FieldLine tone="coral" pull={26} reveal="view" className="connection-rule" />
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
        <a className="back mono" data-return-home href="/#work">← Selected work</a>
        {project ? (
          <article>
            <div className="project-intro"><div><p className="chapter mono"><span /> {project.number} / {project.label}</p>
            <h1>{project.name}</h1>
            <p className="project-lead">{project.summary}</p></div><ProjectIllustration kind={project.slug} /></div>
            <FieldLine tone="rule" pull={16} reveal="load" className="chapter-rule project-rule" />
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
