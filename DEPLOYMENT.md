# Deployment notes

This project builds to a client-rendered static site. The local build and preview require Node.js 22.12 or later. The tested runtime was Node.js 24.

```powershell
npm ci
npm run build
npm run preview -- --host 127.0.0.1
```

The output directory is `dist/`. The site uses the origin root for its routes and public assets. It has no server routes, environment variables, model endpoints, or analytics collectors.

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
