# Deployment notes

This project builds to a client-rendered static site. The local build and preview require Node.js 22.12 or later. The tested runtime was Node.js 24.

```powershell
npm ci
npm run build
npm run preview -- --host 127.0.0.1
```

The output directory is `dist/`. The default build uses the origin root; the GitHub Pages build uses /joo-field-notes/ for routes and public assets. It has no server routes, environment variables, model endpoints, or analytics collectors.

## Static routing

Serve `dist/` as the document root and preserve `/assets/` and other static asset paths. Serve `/index.html` for direct visits and reloads at `/projects/<slug>`, while preserving the browser URL. The home chapter links use URL fragments and resolve on the client.

The checked-in vercel.json configures Vite, dist output and project-route rewrites. In the Vercel project settings, select **Vite**, set the build command to `npm run build` and use `dist` as the output directory. Use a rewrite scoped to the project routes. An example root `vercel.json` is shown below.

```json
{
  "rewrites": [
    { "source": "/projects/:path*", "destination": "/index.html" }
  ]
}
```

See the [Vite guide](https://vercel.com/docs/frameworks/frontend/vite) and [Vercel rewrite documentation](https://vercel.com/docs/routing/rewrites).

## Preview acceptance

- Open the home page, then directly open and reload `/projects/visual-data-qc`, `/projects/resume-copilot`, and `/projects/huahua`.
- Open `/#disclosure-experiment`, `/#caption-inspection`, and `/#growth-timeline` in new tabs to check fragment positioning. Check play, pause and a seek in the caption demo, including on mobile.
- Check that the hero poster is visible before the interactive scene, that the scene responds to pointer or touch input, and that reduced motion and disabled WebGL get the interactive still.
- Test the skip link, visible keyboard focus, and keyboard access to project demos. Check console errors and failed assets using the browser network panel.
- Test on representative phones and desktop GPUs for hardware performance. The local performance measurements in README use simulated mobile and software WebGL.
- Verify the Huahua art terms and the rights to the underlying reference before publishing a build containing the sprite atlas. See the [asset notice](https://github.com/JOO5216/huahua-codex-pet#许可与素材说明).


For the circle transitions, scroll both ways across every chapter on desktop and touch. Check text across the circle edge, the opening particle colors, keyboard focus, reduced motion and forced colors. Confirm that headings never disappear while the circle expands. SVG frames, the studio video and the interactive growth markers must stay aligned at narrow widths. Verify mobile Safari on physical hardware before release; the local acceptance uses Chrome mobile emulation.

Project-navigation acceptance: enter a detail from selected work and from a deep growth node, then return with Selected work and browser Back. Confirm the original position, focused source link and selected node. Check Forward and explicit header chapter links. Test the circular cover with View Transitions disabled and with reduced motion enabled. Project routes still need the static-host rewrite for direct requests and reloads. Home UI state is retained across detail reloads using versioned sessionStorage in the same tab. Test two consecutive detail reloads, then both Selected work and browser Back. Check all four disclosure panels, a non-default growth node, exact scroll position and a delayed chapter import. Closing a restored panel must also persist.


For the three-form opening, test Field → JOO → Orbit → Field, direct selections in both directions, quick interruption, drag without switching, and pause/resume. Check Enter/Space and focus without horizontal movement. Repeat with reduced motion and disabled WebGL and confirm the SVG dots are visible on a narrow viewport. The ice-blue transition dot should sit outside the cloud near the upper-right edge.

## Current production deployment

The live portfolio is https://joo-field-notes.vercel.app (alias: https://joo-field-notes-jdd12.vercel.app). It belongs to the Vercel project jdd12/joo-field-notes. The first production release deploys application commit 62a93e469c5ed418aeacaa8706d617a215762e8b from this repository.

The original release was uploaded using the authenticated Vercel CLI. Native Git integration still reports a missing GitHub Login Connection. The alternative .github/workflows/vercel.yml deploys from GitHub Actions on pushes to main and manual dispatch. It targets the existing project, runs six fixture checks and builds production output before publishing. It is prepared but cannot deploy until VERCEL_DEPLOY_TOKEN is configured. Do not commit .vercel or login credentials.

## GitHub Pages production

Public URL: https://jiaoruotong101-svg.github.io/joo-field-notes/

The repository Pages build source is GitHub Actions. The checked-in .github/workflows/pages.yml publishes on pushes to main and supports workflow_dispatch. Build and deploy jobs have separate minimum permissions; the deploy job uses the github-pages environment and GitHub OIDC. Action versions are pinned to verified release commits. No separate hosting login is required for visitors or routine pushes.

Run npm run build:pages to build this variant. The output includes five project directory entries, a custom 404 entry and .nojekyll. Serve dist under /joo-field-notes/ using an ordinary static server to verify it: a SPA fallback can hide missing-page errors. Test the canonical /projects/<slug>/ URLs, direct entry and reload, fonts, MP4 playback, QC frames, Huahua atlas, three signal forms and persisted home state on desktop and touch. State is scoped to the deployed base so a different project on the same github.io origin cannot accidentally share this archive's navigation record.

The Vercel site remains available. GitHub Pages publishes automatically from main; the Vercel Actions workflow needs the credential setup below before automatic publication works. Keeping the repository and Pages service enabled is required; this is not a guarantee of permanent availability.

## Vercel Actions credential setup

The repository variables VERCEL_ORG_ID and VERCEL_PROJECT_ID target team_LdihCAyU1dGqn9EyrIDNamRI / prj_PKuKqRHbBRrFiF8BIXemqyAa2oy2. The vercel-production GitHub environment permits deployments from main only. The CLI is pinned to 66.0.0, actions are pinned to commit SHAs, and checkout does not retain Git credentials.

1. Sign in to the Vercel account owning jdd12/joo-field-notes (the currently authenticated CLI account is 3511963332@qq.com). At https://vercel.com/account/settings/tokens create a dedicated deployment token, using the narrowest available scope for this project/team. Record its expiration; renew it in GitHub before expiry.
2. Open https://github.com/jiaoruotong101-svg/joo-field-notes/settings/environments and select vercel-production. Under Environment secrets add VERCEL_DEPLOY_TOKEN with that token. Enter it directly in GitHub; never paste it into chat, source files or workflow YAML.
3. Open https://github.com/jiaoruotong101-svg/joo-field-notes/actions/workflows/vercel.yml and run the workflow on main (or rerun the failed setup run).
4. Confirm both Deploy Vercel and Deploy GitHub Pages succeed for the same main commit. Check https://joo-field-notes.vercel.app and the Pages URL above, including direct detail reloads on desktop and mobile.

This is Actions-based deployment, not a claim that native Vercel Git integration is connected. After activation, ordinary pushes to main trigger both workflows independently; a failed deployment on one platform does not roll back the other. Review both workflow results before considering a release complete. No PR or fork event receives the deployment token. Do not upload pulled .vercel configuration as an artifact.
