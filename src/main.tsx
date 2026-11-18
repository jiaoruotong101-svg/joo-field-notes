import { appPathname } from './sitePaths'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/eb-garamond/wght.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './style.css'
import './transitions.css'
import './art-direction.css'
import './chapter-refinements.css'
import './detail-refinements.css'
import './signal-forms.css'
import { ArchiveRouter } from './navigation'


const root = createRoot(document.getElementById('root')!)
document.documentElement.classList.toggle('archive-home', appPathname() === '')
flushSync(() => root.render(<ArchiveRouter />))
