import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/wght.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './style.css'
import './transitions.css'
import { Home, ProjectPage } from './pages'
import { projects } from './content/projects'

const path = window.location.pathname.replace(/\/$/, '')
document.documentElement.classList.toggle('archive-home', !path)
const project = projects.find((item) => path === `/projects/${item.slug}`)
if (project) document.title = `${project.name} / JOO FIELD NOTES`
const root = createRoot(document.getElementById('root')!)
// Cross-document transitions capture the first render of the incoming page.
flushSync(() => root.render(path ? <ProjectPage project={project} /> : <Home />))
