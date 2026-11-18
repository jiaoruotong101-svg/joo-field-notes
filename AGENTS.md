# JOO / FIELD NOTES

This project is an interactive archive of JOO’s work across AI, data quality and visual computing. “Make the Invisible Visible” is the opening concept. Phases 1–5 cover the archive, interactive hero, Visual Data QC frame lab, Resume Copilot sandbox, URL Crawler star map, Huahua Playground, the disclosure timing experiment, the caption inspection timeline and the personal growth timeline. See README for the phase plan, source notes and local commands.

## Visual conventions

Use the navy field (#071426), core blue (#002060), paper (#F5F5F2), ice blue (#D4E6FF) and coral (#F25767). Keep type legible in HTML. EB Garamond carries headlines and prose. IBM Plex Mono marks controls and instrument labels. Preserve the asymmetric desktop hero and readable mobile flow.

## Architecture

React and TypeScript render the archive with Vite. The native links and URL paths resolve through src/main.tsx and src/pages.tsx. Edit project content in src/content/projects.ts. The scene lazily loads on the homepage. Signal.tsx owns native button and pointer interaction. The renderer, geometry and shaders are under src/scene. The Visual Data QC page lazily loads src/lab, which owns the synthetic fixture, perspective viewer, rule inspection and report.

## Development

Keep pointer changes outside React render state. Dispose GPU resources, disconnect observers and stop the frame loop on teardown or when the scene leaves the viewport. Keep the still rendering in public/signal-still.webp available in case WebGL is disabled. Use the supplied brief and public repository evidence for portfolio copy. Use original or explicitly licensed assets and synthetic examples for case demos.

## Acceptance

Run npm run build. Open a production preview and check the route from the opening to selected work, a direct project URL and its repository link. Verify hover, drag and inertia, morph by mouse, touch and keyboard, scroll camera movement, pause and reduced motion, and content access without WebGL. Inspect desktop and mobile layouts for clipping and check console and resource failures.

For the frame lab, verify pointer picking and keyboard or touch sample selection, overlay visibility, each review state, report invalidation on edits, and the content of the downloaded JSON. Test the same review flow with WebGL disabled.

For the Resume Copilot sandbox, run npm run check:resume and verify matching evidence, optional inclusion, preview cancellation, selective local fill and reset. All suggestions and form values must stay on the demo page.

For the URL Crawler star map, run npm run check:crawler and verify page switching, deduplication in scan order, provenance inspection, CSV content, touch controls and reset. Use local fixtures only.

For Huahua Playground, run npm run check:huahua and verify original atlas delivery, all gaze directions, idle, wave and jump, tap and keyboard activation, pause and reduced motion.

For the disclosure experiment, run npm run check:disclosure and verify the explanation reveal matrix, identical decision across conditions, three independent ratings and session-only feedback. Keep the experiment labelled as simulated and preserve the fictional scenario.

For caption inspection, run npm run check:caption and verify MP4 decode, a seek before loading, playback, annotation synchronization, all three issue jumps and their reference evidence. Keep the footage and tracks synthetic.

For the personal timeline, verify icon alignment with the existing constellation, all five node states, project and chapter destinations, keyboard and touch input, and reduced motion. Use existing biographical and project details.

For Phase 5, verify the desktop and mobile hero budgets, skip and focus behavior, reduced-motion startup, WebGL-disabled still reshape, deferred chapter requests and direct fragment links. Read DEPLOYMENT.md for production hosting checks.

For interface motion, check chapter parallax, near-boundary wheel alignment, deep-link focus, populated incoming view snapshots, touch scrolling and reduced motion.

The palette-dot transition and typography overrides are in src/art-direction.css and ChapterColors.tsx. Keep palette colors exact, preserve a straight resting baseline for FieldLine, and verify chapter contrast at rest and during scroll. Reduced motion uses solid color changes.

## Next development task

Run the physical-device and hosting checks in DEPLOYMENT.md before an authorized release. Review the Huahua artwork terms before serving a build that includes the atlas.


Chapter wipes must keep content visible. The local text masks and shader circle share viewport coordinates; preserve deterministic reverse scrolling and avoid time-based delayed chapter reveals. Keep fixed dark demo panels outside the ink masks. New reading surfaces on the open chapter background should be included in the ChapterColors ink target selector. Rounded illustration and caption styles live in src/chapter-refinements.css. Preserve growth node coordinates and authored caption action timing when redrawing assets.

Local project navigation now runs through src/navigation.tsx. Keep the homepage mounted but hidden and inert while a project is active; preserve its history-entry scroll position and focus on return. ChapterColors must ignore project scrolls and remeasure synchronously on archive:restore before taking a View Transition snapshot. Never await requestAnimationFrame inside the transition update callback: the browser suspends rendering there. Verify return links, Back/Forward, deep growth-node state, explicit chapter anchors, reduced motion and the circle-cover fallback. Detail and disclosure styles live in src/detail-refinements.css; project diagrams are original inline SVG in ProjectIllustration.tsx.

Home UI persistence is centralized in src/homeState.ts using versioned sessionStorage with schema validation and an in-memory fallback. RememberedDetails controls the two research and two Caption details elements; GrowthTimeline persists only its selected node. Keep this record limited to navigation/UI state. A cold detail reload mounts the saved home hidden, restores previously loaded lazy chapters, and waits for their readiness and fonts before capturing the return transition. Restore an anchor plus its offset after layout, and preserve explicit chapter links. Check repeated detail reloads, both return paths, closed-state persistence, delayed imports, corrupt/disabled storage and tab scoping.

Caption faces use single filled ellipses; do not reintroduce composite rounded face fills or vertical face lines. Run python scripts/check-caption-faces.py against the decoded MP4 after fixture changes. Change the media/poster revision query in CaptionInspection.tsx whenever regenerating them so old browser caches cannot mask the fix.

The hero has three forms: Living field, JOO letterform and Signal ring. SignalControls.form is 0/1/2; use uShape weights rather than a scalar morph so arbitrary interrupted transitions stay continuous. Keep one Points draw and the current mobile budgets. The cycle surface is named Next particle shape; direct buttons form the Particle shape group with aria-pressed selection. Reduced motion, paused rendering and disabled WebGL must support all three choices. Use filled dot subpaths for the static SVG ring and verify actual raster output on mobile. Do not move the ice-blue chapter dot back into the cloud; its work-transition origin is 97% / 18%.
