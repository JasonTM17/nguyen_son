# Project Overview and Product Requirements

## Overview

Nguyen Son Portfolio is a static React portfolio that presents a concise introduction, selected public repositories, working principles, and a GitHub profile link. It is intentionally a single page with no application backend.

## Product goals

| Goal | Source-backed implementation |
| --- | --- |
| Present Nguyen Son's work clearly | Hero, about copy, and four typed project records. |
| Let visitors reach relevant sections quickly | Sticky anchor navigation plus a skip link. |
| Keep the portfolio usable without WebGL | HTML content and an SVG Signal Lattice fallback render independently of the canvas. |
| Respect motion and high-contrast needs | System/local reduced-motion handling and forced-colors handling disable the canvas path. |
| Keep public claims bounded | Content links directly to the `JasonTM17` GitHub account and selected repositories. |

## Functional requirements

1. Show the public name Nguyen Son, a product-systems introduction, focus areas, and a GitHub profile link.
2. Provide in-page navigation to Work, Principles, and About.
3. Render the selected work from typed static data: FoodFlow, Money Management, VN TravelAI, and AI-powered waste sorting.
4. Open external GitHub destinations in a separate browsing context with `rel="noreferrer"`.
5. Give visitors a motion-reduction control when the operating system has not already requested reduced motion.
6. Show the decorative Signal Lattice as SVG first; add the Three.js canvas only when the current preference and forced-colors state allow it.

## Non-functional requirements

| Area | Requirement reflected in source |
| --- | --- |
| Rendering | React 19 and Vite build a static client-side page; `package.json` declares Node `^20.19.0 || >=22.12.0`. |
| Type safety | TypeScript project references enable strict checks with unused locals and parameters rejected. |
| Accessibility | Semantic landmarks/headings, a skip link, visible focus, readable HTML content, and a non-WebGL fallback are present. |
| Motion | `prefers-reduced-motion` is a hard lower bound; the optional local setting can only reduce further motion. |
| High contrast | Forced-colors mode replaces CSS tokens with system colors and suppresses the WebGL host. |
| Performance | The Three.js runtime is lazily imported and renders only in response to relevant lifecycle, resize, visibility, or fine-pointer events. |
| Resource lifecycle | Scene setup failure and normal cleanup dispose Three.js resources and the renderer. |

## Scope boundaries

- No application API client, authentication flow, form submission, analytics integration, or database layer is present in the repository source.
- The selected-work copy is static; repository details are not fetched at runtime.
- GitHub Pages, another hosting provider, and a custom domain are not configured in this repository.
- A license decision is not represented by a license file in the current project layout.

## Acceptance evidence in the repository

| Concern | Existing automated evidence |
| --- | --- |
| Primary content and visual fallback | `src/app.test.tsx` renders the page and checks the SVG fallback. |
| Local motion preference | `src/app.test.tsx` checks the motion button's pressed state and accessible name. |
| Project-link ownership | `src/content/portfolio-data.test.ts` verifies GitHub host and `JasonTM17` repository paths. |
| Scene initialization failure | `src/components/signal-lattice-scene.test.tsx` verifies that a failing runtime leaves the SVG fallback in place and does not leave a canvas. |
| Browser accessibility | `tests/portfolio-accessibility.spec.ts` uses axe, checks console errors, keyboard focus, 320px overflow, operating-system reduced motion, forced colors, and a mobile coarse-pointer case across two Chromium projects. |

## References

- [Codebase summary](./codebase-summary.md)
- [System architecture](./system-architecture.md)
- [Design guidelines](./design-guidelines.md)
- [Project roadmap](./project-roadmap.md)
