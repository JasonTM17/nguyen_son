# Project Overview and Product Requirements

## Overview

Nguyen Son Portfolio is a static React portfolio that presents a concise introduction, selected public repositories, working principles, and a GitHub profile link. It is intentionally a single page with no application backend.

## Product goals

| Goal | Source-backed implementation |
| --- | --- |
| Present Nguyen Son's work clearly | Hero, about copy, and four typed project records. |
| Give the portfolio a distinctive personal identity | A large light-mode hero with a project-local 3D portrait studio and factual engineering/DevOps statement. |
| Let visitors reach relevant sections quickly | Sticky anchor navigation plus a skip link. |
| Keep the portfolio usable without WebGL | HTML content, project-local artwork, and an SVG studio fallback render independently of the canvas. |
| Respect motion and high-contrast needs | System/local reduced-motion handling and forced-colors handling disable the canvas path. |
| Keep public claims bounded | Content links directly to the `JasonTM17` GitHub account and selected repositories. |

## Functional requirements

1. Show the public name Nguyen Son, a Software Engineer / DevOps statement, a learning/feedback invitation, focus areas, and a GitHub profile link.
2. Provide in-page navigation to Work, Principles, and About.
3. Render the selected work from typed static data: FoodFlow, Money Management, VN TravelAI, and AI-powered waste sorting.
4. Open external GitHub destinations in a separate browsing context with `rel="noreferrer"`.
5. Give visitors a motion-reduction control when the operating system has not already requested reduced motion.
6. Always render the local studio artwork and an inline SVG studio fallback; add the Three.js canvas only when the current preference and forced-colors state allow it.

## Non-functional requirements

| Area | Requirement reflected in source |
| --- | --- |
| Rendering | React 19 and Vite build a static client-side page; `package.json` declares Node `^20.19.0 || >=22.12.0`. |
| Type safety | TypeScript project references enable strict checks with unused locals and parameters rejected. |
| Accessibility | Semantic landmarks/headings, a skip link, visible focus, readable HTML content, and a no-WebGL visual path are present. |
| Motion | `prefers-reduced-motion` is a hard lower bound; the optional local setting can only reduce further motion. |
| High contrast | Forced-colors mode replaces CSS tokens with system colors, suppresses the WebGL host, and uses the SVG fallback. |
| Performance | The Three.js runtime is lazily imported; fine-pointer icon motion is capped at roughly 14fps and stops when the scene is offscreen or the document is hidden. |
| Resource lifecycle | Scene setup failure and normal cleanup dispose Three.js resources and the renderer. |
| Asset privacy | The owner artwork is a local repository asset; no runtime remote portrait request occurs. |

## Scope boundaries

- No application API client, authentication flow, form submission, analytics integration, or database layer is present in the repository source.
- The selected-work copy is static; repository details are not fetched at runtime.
- Vercel hosts the production static site. A custom domain is not configured.
- A license decision is not represented by a license file in the current project layout.

## Acceptance evidence in the repository

| Concern | Existing automated evidence |
| --- | --- |
| Primary content and visual fallback | `src/app.test.tsx` renders the page, slogan, and studio fallback. |
| Local motion preference | `src/app.test.tsx` checks the motion button's pressed state and accessible name. |
| Project-link ownership | `src/content/portfolio-data.test.ts` verifies GitHub host and `JasonTM17` repository paths. |
| Scene initialization failure | `src/components/studio-scene.test.tsx` verifies that a failing runtime leaves the static path in place and does not leave a canvas. |
| Browser accessibility | `tests/portfolio-accessibility.spec.ts` uses axe, checks console errors, keyboard focus, 320px overflow, operating-system reduced motion, forced colors, and a mobile coarse-pointer case across two Chromium projects. |

## References

- [Codebase summary](./codebase-summary.md)
- [System architecture](./system-architecture.md)
- [Design guidelines](./design-guidelines.md)
- [Project roadmap](./project-roadmap.md)
