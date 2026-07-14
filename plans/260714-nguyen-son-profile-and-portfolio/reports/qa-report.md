---
title: Quality assurance report
date: 2026-07-14
---

# Quality Assurance Report

## Summary

The Nguyen Son portfolio passes its local type, lint, unit, build, browser, accessibility, link, and dependency-audit gates. The page was also visually inspected at desktop and 320px widths. No Food_Delivery file was changed.

## Verification evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Type safety | Pass | `npm run typecheck` exited 0. |
| Linting | Pass | `npm run lint` exited 0. |
| Unit tests | Pass | `npm run test`: 4 files, 11 tests passed. |
| Production build | Pass | `npm run build` exited 0. |
| Browser and a11y tests | Pass | `npm run test:e2e`: 11 passed; one desktop-only coarse-pointer test was intentionally skipped. |
| Dependency audit | Pass | `npm audit --omit=dev` reported 0 vulnerabilities. |
| Documentation links | Pass | All local Markdown links in README and `docs/` resolved. |
| Visual QA | Pass | Desktop and 320px screenshots were inspected locally. |

## Browser coverage

- Desktop Chromium and iPhone 13-configured mobile Chromium both cover semantic headings, axe serious/critical findings, console errors, keyboard skip-link access, and mobile overflow.
- Reduced-motion and forced-colors environments retain the SVG fallback and create no canvas.
- A synthetic `webglcontextlost` event removes the canvas and restores the fallback.
- The mobile coarse-pointer case confirms a pointer move does not schedule an additional scene frame.

## Review findings resolved

| Finding | Resolution |
| --- | --- |
| Partially initialized Three.js scenes could leak resources. | Scene initialization now accumulates resources immediately and disposes partial state on failure. |
| Missing or legacy `matchMedia` support could break startup. | `useMediaQuery` safely defaults to no match and supports modern plus legacy listeners; runtime media checks use the same safe boundary. |
| The coarse-pointer test checked only DOM presence. | It now waits for canvas setup and asserts a touch-pointer move schedules no new render frame. |
| A lost WebGL context could leave a broken canvas over the fallback. | The runtime listens for `webglcontextlost`; the component cleans up the canvas and restores the SVG fallback. |

## Performance note

The production build keeps the Three.js renderer in a lazy chunk: 529.80 kB minified / 132.81 kB gzip. The primary bundle is 201.78 kB minified / 63.78 kB gzip. The renderer has no models, textures, post-processing, or continuous animation loop, and is not loaded for reduced-motion or forced-colors users.

## Visual artifacts

- `portfolio-desktop.png`
- `portfolio-mobile.png`

## Unresolved questions

- Hosting, custom domain, analytics, and portfolio license remain deliberately unselected.
