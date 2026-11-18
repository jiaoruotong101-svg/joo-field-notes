# JOO / FIELD NOTES

GitHub Pages: https://jiaoruotong101-svg.github.io/joo-field-notes/

Vercel mirror: https://joo-field-notes.vercel.app

Phase 1–4 of an English-language interactive portfolio for JOO. The first page presents a live WebGL signal and leads into a six-chapter archive. Each of the five selected works has a direct URL and a repository link.

## Run locally

Use Node.js 22.12+ (the build was checked with Node 24).

```powershell
npm ci
npm run dev -- --host 127.0.0.1
```

Open the local address printed by Vite. To check the production build:

```powershell
npm run build
npm run preview -- --host 127.0.0.1
```

## Design and implementation

The opening takes the form of an observation field. Large EB Garamond typography and a quiet measurement grid frame a particle body. A navy field (#071426), a deeper core blue (#002060), ice blue (#D4E6FF), paper white (#F5F5F2), and coral (#F25767) carry through the archive. Coral marks interaction and the more concentrated particle bands. IBM Plex Mono is reserved for controls and instrumentation.

- **Phase 1** established the visual system, native anchors, archive sections and project URLs. The public repository descriptions are curated in TypeScript and bundled with the site.
- **Phase 2** adds a seed-based Three.js point cloud, a vertex and fragment shader, pointer force, drag inertia, click/tap/keyboard morphing and a scroll-driven camera. The shape cycles through the living particle field, a sampled JOO letterform and a braided signal ring. Click/tap the surface or use Enter/Space to cycle; Field / JOO / Orbit selects any form directly. Three GPU target weights blend from the current mixture, so rapid selections remain continuous. The pause button stops motion. The renderer uses a lower initial budget on mobile and can lower resolution and particle draw count during sustained slow rendering.
- **Phase 3** adds the Visual Data QC frame lab. Inspect the 10%, 50% and 90% synthetic editorial stills in a Three.js scene, toggle detection boxes, compare the fixture with the documented rules, and mark each sample Accept, Hold or Reject. Generate a simulated report in the page and export it as JSON.
- **Phase 4** includes the Resume Copilot sandbox, the URL Crawler star map, the Huahua Playground, the disclosure-timing experiment, the caption inspection timeline and the personal growth timeline. Confirm public asset rights, the personal-role descriptions, contact details, résumé link and measurement definitions before adding them to the archive.
- **Phase 5** reduces the initial homepage payload, adapts the hero rendering budget on mobile, and verifies keyboard, reduced-motion and WebGL fallback behavior in local production preview. Hosted and physical-device validation remain release checks.

## Sources and decisions

- [Hisami Kurita Portfolio](https://hsmkrt1996.com/) and [source](https://github.com/hisamikurita/hisamikurita-portfoliosite-v2022). Its public code places animation, canvas scenes and editorial sections in separate components. The transferable principle is to let typography lead into the work and use motion at chapter boundaries. The live session was limited by the loading layer.
- [FunGUI](https://fungui.resn.co.nz/) and [interview with its creative coder](https://spaces.is/loversmagazine/interviews/guillaume-lanier). The browser showed a full-screen canvas responding to input. The author describes using ray marching. Here, pointer input instead displaces a local region of an actual 3D point cloud and drag carries angular momentum.
- [Penderecki’s Garden](https://pendereckisgarden.pl/en) and [its design case study](https://www.feats.co/project/pendereckis-garden). Its entry frames the scene as a story about a place, with chapter navigation and point-cloud depth. The site opened at the audio and loading introduction in the initial browser pass.
- The work index uses the README and public file structure of [Visual Data QC](https://github.com/JOO5216/tt-ins-yt-media-cv-qc), [Resume Copilot](https://github.com/JOO5216/resume), [URL Crawler](https://github.com/JOO5216/tt-ins-url-crawler), [Huahua](https://github.com/JOO5216/huahua-codex-pet) and [JDDs Skills](https://github.com/JOO5216/JDDs-skills). Visual Data QC also uses [the video check specification](https://github.com/JOO5216/tt-ins-yt-media-cv-qc/blob/main/VIDEO_QC_README.md). The repos are linked. Their example media, fixtures and character assets are not bundled here.
- Research and internship summaries use the supplied brief. Statistics, personal contact information and a public résumé URL are pending confirmation.

## Visual Data QC frame lab

Open `/projects/visual-data-qc` from Selected work. Choose a frame in the perspective view or use the three sample buttons. Each sample holds its own decision and optional note. After all three decisions, generate the report. It stores the fixture metadata, box coordinates, per-frame simulated results, the aggregate checks, and the reviewer disposition. A later review edit removes the old report until regenerated. The page holds review state in memory. Download the JSON to keep it after reloading.

The three frames use generated editorial stills of a fictional model. Their face boxes and clip metadata are fixture values. In the source pipeline, FFprobe reads actual clip metadata and YuNet samples actual frames. The browser demonstration exposes those rule comparisons and the human review workflow using synthetic evidence. It also offers a 2D view when WebGL is unavailable.

## Resume Copilot sandbox

Open `/projects/resume-copilot` in Selected work and pick a field to inspect the source and matching rationale. Edit the suggested value and choose whether to include it in the next fill. Preview lists the exact values. Confirm copies them to the read-only mock application; Cancel and Escape leave the mock application as it was. The demo uses scripted suggestions and in-memory state, with all edits and fills handled on the page. Reset or reload starts a fresh demo.

Run `npm run check:resume` to check selection defaults, manual values, and empty-field handling. Browser acceptance covers field matching, edits, preview and cancellation, selective fill, reset, desktop and touch layouts, and local-only requests.

## QC image provenance

`public/qc/studio-run.webp` contains the three stills, generated with built-in ImageGen and encoded for local delivery. The detection box coordinates are scripted in `src/lab/fixture.ts`.

<details>
<summary>ImageGen prompt</summary>

Create a synthetic video contact sheet for a computer-vision portfolio. Exactly three equally tall wide landscape stills stacked vertically edge to edge, no gaps, no borders, no labels, no overlay. Each panel aspect about 16:9 so the full image is tall portrait. Same fictional adult East Asian female fashion model with short black bob, understated makeup and charcoal technical jacket in the same dark teal architectural studio with vertical light strips and textured dark walls. Fashion editorial photography, realistic skin and optics, soft key light and warm rim light, cinematic deep teal and subtle warm amber industrial detail. Top panel: eye-level head and shoulders, looking slightly past camera, face at horizontal center and middle of panel, head roughly one-third of the panel height. Middle panel: wide full-body framing, same woman standing at center much farther from camera, her face clearly visible around upper middle, her head roughly one seventh of the panel height. Bottom panel: same woman and environment at medium distance but an upright dark-teal foreground divider completely covers her entire head, part of one shoulder and jacket still visible beyond the divider; intentional cinematography, no visible face. No typography, UI, bounding boxes, watermarks or other people. Realistic editorial stills, not a cartoon or 3D character render.

</details>

## URL Crawler star map

Open `/projects/url-crawler` and select a fixture page. Discovering a page reveals its sources, creators and unique videos. Select a map node to read its discovery records, or inspect a page's ledger to compare raw and canonical URLs. Pages can be scanned in any order. The first scanned appearance owns the video record; duplicates may add source provenance. The three synthetic pages contain 12 rows, 9 unique videos and 3 duplicates. Reset or reload clears the session.

Preview the CSV to inspect the unique rows, then download it locally. The sample URLs use a reserved placeholder hostname. Page discovery runs against bundled fixtures and creates no crawler traffic. Run `npm run check:crawler` for canonicalization, duplicate precedence and CSV checks.

## Huahua Playground

Open `/projects/huahua` from Selected work or the archive's personal chapter. Move a mouse around the stage to see the 16 gaze directions. Press the character to alternate between wave and jump, or use the Wave and Jump buttons by pointer, touch or keyboard. Pause motion stops autoplay. The browser's reduced-motion setting shows a single pose per gesture. Playback suspends when the stage leaves the viewport or the tab becomes hidden.

The route lazily loads the unchanged 1536 × 2288 WebP atlas from [JOO5216’s Huahua repository](https://github.com/JOO5216/huahua-codex-pet/tree/2bdbb17c5b8e05b7044c1d58fa9dce16d91797c5). Atlas rows and active cells come from its validation report. Wave and jump timing follow the animation previews, with a small upward translation added for the web jump. The browser handles playback and pointer direction. Run `npm run check:huahua` to verify the original asset hash, frame bounds and 16-way mapping.

The upstream [LICENSE](https://github.com/JOO5216/huahua-codex-pet/blob/2bdbb17c5b8e05b7044c1d58fa9dce16d91797c5/LICENSE) applies MIT to scripts and configurations. The [asset notice](https://github.com/JOO5216/huahua-codex-pet#许可与素材说明) limits images and animations to personal, learning and noncommercial sharing uses. It also asks users to check the rights to the underlying reference. This integration was tested as a local personal demo. Check the underlying artwork rights before publishing a build that includes the asset.

## Disclosure timing experiment

From Research, choose **Try the disclosure experiment**. The fictional lab booking request, explanation, and waitlist outcome are shared across the three conditions. Before review reveals the explanation at the request. During review reveals it during the review. After decision reveals it after the outcome, on the feedback step.

Each condition keeps its own progress and three illustrative five-point responses during the current page visit. The procedure, interaction and outcome questions become available after the decision. Restart clears the selected condition, and refreshing clears all conditions. Ratings stay in memory and the simulation displays only the participant's own selections. Run `npm run check:disclosure` for timing and feedback validation.

## Multimodal caption inspection

Open the practice chapter and choose **Try the caption inspection**. The browser plays the original 12-second silent MP4 from `public/caption/studio.mp4`. Scrub the range input or select an annotation segment. The inspector follows the playhead and shows that segment's caption, person ID and interval.

**Run checks** marks the synthetic track. The seeded fixture contains an uncovered second at 04.00–05.00, a wrong action caption at 06.00–08.00, and a wrong person ID at 08.00–10.00. Select any finding to seek to its midpoint and compare observed and reference values. Coverage flags gaps longer than one frame. The action and identity checks use the authored reference at each segment midpoint. The video, actors, annotations and rule examples were created for this website.

Run `npm run check:caption` for boundary and finding checks. Browser acceptance includes the first drag before the video has loaded, MP4 decoding, seeking and touch controls. To regenerate the MP4 and poster, install Python packages Pillow and imageio-ffmpeg and run `python scripts/generate-caption-clip.py`.

## Personal growth timeline

Open The Human chapter and select a node on the existing `field-constellation.svg` artwork. The map starts from management science and connects it to AI and engineering, research, project work and Huahua. The notes reuse the current archive narrative, project records and existing case links. Node placement organizes the connections without assigning dates.

Each node is a keyboard- and touch-accessible button. Selection moves the highlight and updates the adjacent note. The map stacks above the note on narrow screens. Reduced motion removes the movement.

## Structure

```text
src/
  main.tsx                 Entry and project-path resolution
  pages.tsx                Archive, navigation and case detail layouts
  style.css                Visual system and responsive layouts
  components/Signal.tsx    Pointer input and accessible controls
  content/projects.ts      Curated project records
  lab/                     Synthetic fixture, WebGL frames, review and report
  resume/                  Fictional résumé, field matching and mock application
  crawler/                 Fixture pagination, node map, deduplication and CSV
  huahua/                  Original v2 atlas, frame playback and Playground
  research/                Fictional scenario, disclosure timing and fairness feedback
  caption/                 Video transport, annotation track and evidence checks
  growth/                  Interactive star map and archive links
  scene/
    SignalCanvas.tsx       Renderer, camera, frame loop and disposal
    geometry.ts           Point samples, bands and letterform targets
    shaders.ts            GPU deformation, point appearance and color
public/
  signal-still*.webp       Desktop and mobile stills from the original shader
  signal.svg               Site icon
  illustrations/          Original SVG diagrams for the archive chapters
  caption/                 Original silent MP4 and its poster
```

## Phase 5 verification

The hero can switch among a still particle image, a JOO letterform and an original dotted SVG signal ring with the keyboard, mouse or touch even with WebGL disabled. A cold visit with reduced motion skips the 3D download. An unavailable WebGL2 context selects the same static control. Desktop and small screens receive separate poster sizes. The local homepage defers the research, caption and personal interactions until they get near the viewport.

The mobile tier constructs only the 20,000 points it can draw, caps the drawing-buffer pixel ratio at 1.2 and limits idle drawing to about 30 draws per second. Touch, morph and camera changes can use the browser's regular animation-frame cadence. The scene suspends rendering out of view or while the page is hidden, and reduces quality if the observed render cadence drops. Desktop retains its larger initial budget.

Chrome / Playwright checked the production desktop and simulated touch paths, including skip focus, the shape toggle, pause and resume, viewport-gated chunks, reduced motion, WebGL fallback, and direct fragment links. The caption clip has a timestamped visual transcript. The axe scan used WCAG 2 and 2.1 A/AA, WCAG 2.2 AA, and best-practice rules across the home page and five case routes. The sampled pages had zero reported violations after the accessible-name fixes. Automated checks cover only the rules and states tested.

### Local performance comparison

Cold Chrome runs used a local Vite production preview and software WebGL. The mobile profile used a 390 × 844 CSS-pixel viewport, DPR 2, 4× CPU throttling, 150 ms latency and 1.5 Mbps download. Measurements include resources recorded through the initial hero startup window and exclude the navigation document.

| Profile | Initial resources before | Initial resources after |
| --- | ---: | ---: |
| Desktop | 478 kB | 368 kB |
| Simulated mobile | 478 kB | 329 kB |

In the simulated mobile sample, the first live particle frame arrived at 3.18 s before the changes and 2.71 s after. Desktop first live paint moved from 0.64 s to 0.96 s in the sampled runs, with the optimized still shown while the graphics context starts. These single-run timings are illustrative. The mobile renderer recorded about 30 particle draws/s during ambient animation and about 63 draws/s during a morph in a separate unthrottled automated run. Browser frame cadence is distinct from particle draw cadence. Physical-device performance remains open.

The shared Three.js chunk is about 535 kB minified and 132 kB gzip. Vite flags its raw size. It is shared by the hero and Visual Data QC and is loaded on demand.

## Interface motion

Home chapter headings ease in with scroll-linked animation. The existing illustrations and the closing orbit move on a separate scroll timeline. Near a desktop chapter boundary, the page aligns after wheel scrolling settles, within 56 CSS pixels and in the direction of travel. Touch scroll and keyboard navigation use the browser's own scrolling.

Project navigation uses the same circular language as the chapter backgrounds. src/navigation.tsx handles local project links, browser history, focus and scroll restoration. A View Transition reveals the incoming page from the clicked point, with a viewport-sized circle. Browsers without that API use an animated core-blue cover; reduced motion changes pages immediately. Modified clicks, new tabs, downloads and external links keep native behavior.

The home stays mounted, hidden and inert while a detail page is open. Returning through Selected work or browser Back restores its position, expanded content and selected growth node. The hidden particle scene stops drawing through its viewport observer; video playback pauses on navigation. Circle masks are synchronously remeasured before the incoming snapshot. A versioned sessionStorage record now retains the home URL, scroll anchor and offset, four open disclosure panels, loaded chapter IDs, source link and selected growth node across detail-page reloads in the same tab. Before returning, previously loaded chapters and fonts are prepared outside the transition callback, then the restored layout is measured. Closed disclosure values persist as well. Storage errors or invalid records fall back to a usable archive. Session storage contains only this navigation/UI state; it does not store résumé fields or experiment responses. A direct detail-page visitor returns to the work chapter. Explicit Research and Contact links still navigate to their own chapters.

Each project has an original rounded SVG diagram, and demo containers, controls and dialogs share the archive's rounded geometry. The disclosure experiment uses ice-blue surfaces, navy text and coral selection accents. Its scenario, conditions, explanation timing and feedback logic are unchanged. The procedural video now uses solid oval face primitives and no vertical nose stroke. The old composite face fill left a visible center seam even after the hair cap was changed. The MP4 and poster URLs carry a revision query so existing tabs request the corrected assets. Run python scripts/check-caption-faces.py to decode every frame and check the flat band between the eyes for a center seam.

Desktop (1440px) and simulated touch (390px) acceptance covered circular transitions, return-link and browser Back/Forward position, a deep growth-node return with preserved selection, explicit chapter links, direct detail entry, reduced motion and the no-View-Transition fallback. All five detail pages and the disclosure chapter had no axe violations in the sampled initial states. Disclosure timing, Caption playback/findings, Resume matching, Crawler export and Huahua interactions also passed browser regression checks. Repeated detail reloads followed by both Selected work and browser Back restored all four disclosure states, the selected growth node and exact scroll position at 1440px and simulated 390px touch. Corrupt and blocked session storage were also checked. Physical-device Safari validation remains open.

## Garamond and chapter color transitions

The display and reading face is locally bundled EB Garamond. IBM Plex Mono remains on instrument readouts and compact data labels.

The shared FieldLine components rest on a straight baseline. Mouse proximity pulls a local segment away from that baseline. A damped spring returns the line, including a short overshoot. Reduced motion keeps the baseline straight.

The home background uses a fixed layer of palette dots. Scrolling toward the next chapter expands its dot until that color fills the viewport. The work chapter uses #D4E6FF, research #002060, practice #F25767, personal growth #071426, and contact #D4E6FF. Chapter content stays visible throughout the transition. Headings and prose use a local circular text mask that switches ink exactly where the new background passes. A small scroll-linked drift connects the content to the expanding dot; chapter spacing is tightened. The opening particle shader samples the same circle in screen coordinates, changing the covered particles to core blue and coral while retaining the existing scroll camera movement. Scrolling upward reverses the expansion. Reduced motion changes the solid background without expanding dots.

Implementation lives in src/components/ChapterColors.tsx, src/art-direction.css and src/chapter-refinements.css, with the elastic lines in src/components/FieldLine.tsx. src/scene/chapterMotion.ts passes the circle coordinates to the GPU renderer without React state updates. Forced colors restore ordinary system text; reduced motion keeps solid background changes and removes drift.

The three original chapter SVGs now use rounded frames and the archive palette. The synthetic Caption clip uses original soft illustrated characters, a blue window and rounded studio scenery, rendered at 2x before downsampling. Its 12-second duration, character IDs, object actions and seeded findings are preserved. No external footage or company data is used.

Production preview was checked in Chrome at 1440px and simulated touch at 390px: all five chapter wipes forward and backward, continuously visible content, horizontal overflow, caption seeking/playback and findings, and growth node alignment. Reduced-motion chapter scans reported no axe violations in the sampled regions. These checks are browser emulation, not physical-phone validation.

## Hosting

See [Deployment notes](DEPLOYMENT.md) for static routing, future Vercel settings and the pre-release acceptance steps.




## Three signal forms

The original living field, the JOO glyph and a braided orbital ring share one Points draw and one geometry. src/scene/forms.ts defines the torus strands; geometry.ts adds aOrbit, and the shader combines body, glyph and orbit with three continuously damped weights. The existing force field, burst, drag inertia, scroll camera and chapter color wipe remain active. Particle counts and resolution caps are unchanged. Reduced motion and pause snap to the selected form. The static orbit uses three filled SVG paths; it does not download Three.js. Use filled dot contours so the tiny fallback dots still rasterize on narrow screens.

The ice-blue chapter dot now rests near the upper-right viewport edge (97% / 18%), away from the opening cloud. The other ice-blue seed sits at the left margin. Both retain their chapter transition role. The hero uses overflow: clip to keep keyboard focus from horizontally scrolling the oversized canvas inside its composition.

Production-preview checks at 1440px and simulated 390px touch covered all three live forms, direct and cyclic input, rapid selection, drag without an accidental form change, pause/resume, visible static alternatives with reduced motion or disabled WebGL, console errors, overflow and hero axe rules. The mobile static SVG was also rasterized to confirm that its dots paint. These are browser-emulation checks, not physical-device performance measurements.

## GitHub Pages

Pushes to main run .github/workflows/pages.yml: the workflow installs the locked dependencies, verifies the six interactive fixtures, builds for /joo-field-notes/, then publishes the Pages artifact. No personal access token or Vercel login is stored in the workflow. The Pages settings use GitHub Actions as their build source.

Use npm run build:pages for the subdirectory deployment; npm run build retains the Vercel/origin-root output. src/sitePaths.ts centralizes public asset URLs, internal links and router normalization. Navigation state stores application-relative paths in a base-scoped session key. scripts/prepare-pages.mjs writes a physical projects/<slug>/index.html for each structured project so direct visits and reloads return a real static page, without a server rewrite or a redirect-through-404 workaround.

## Vercel automatic deployment

.github/workflows/vercel.yml prepares the second production pipeline on pushes to main. It uses the existing Vercel project and the same six fixture checks as Pages. Activation is pending the VERCEL_DEPLOY_TOKEN environment secret; follow [credential setup](DEPLOYMENT.md#vercel-actions-credential-setup). Until its first successful run, only Pages automatic publication is verified. Both pipelines run independently, with Node.js 24 and different hosting base paths.
