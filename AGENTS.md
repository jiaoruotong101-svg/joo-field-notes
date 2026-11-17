# JOO / FIELD NOTES

This project is an interactive archive of JOO’s work across AI, data quality and visual computing. “Make the Invisible Visible” is the opening concept. Phases 1–5 cover the archive, interactive hero, Visual Data QC frame lab, Resume Copilot sandbox, URL Crawler star map, Huahua Playground, the disclosure timing experiment, the caption inspection timeline and the personal growth timeline. See README for the phase plan, source notes and local commands.

## Visual conventions

Use the navy field (#071426), core blue (#002060), paper (#F5F5F2), ice blue (#D4E6FF) and coral (#F25767). Keep type legible in HTML. Bricolage Grotesque carries headlines and prose. IBM Plex Mono marks controls and instrument labels. Preserve the asymmetric desktop hero and readable mobile flow.

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

## Next development task

Run the physical-device and hosting checks in DEPLOYMENT.md before an authorized release. Review the Huahua artwork terms before serving a build that includes the atlas.

