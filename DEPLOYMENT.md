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

For a future Vercel deployment, select **Vite**, set the build command to `npm run build` and use `dist` as the output directory. Use a rewrite scoped to the project routes. An example root `vercel.json` is shown below.

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

