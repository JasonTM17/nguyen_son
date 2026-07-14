# Project Overview and Product Requirements

## Overview

Nguyen Son Portfolio is a React portfolio for a student developer. It presents a concise introduction, selected and archived public repositories, learning principles, a GitHub profile link, and a grounded portfolio assistant. It remains a single page, with one narrow Vercel serverless endpoint for assistant responses.

## Product goals

| Goal | Source-backed implementation |
| --- | --- |
| Present Nguyen Son's work clearly | Student-focused hero/about copy, four featured project records, and a complete 19-project archive. |
| Give the portfolio a distinctive personal identity | A large light-mode hero with a project-local 3D portrait studio and factual engineering/DevOps statement. |
| Let visitors reach relevant sections quickly | Sticky anchor navigation plus a skip link. |
| Keep the portfolio usable without WebGL | HTML content, project-local artwork, and an SVG studio fallback render independently of the canvas. |
| Respect motion and high-contrast needs | System/local reduced-motion handling and forced-colors handling disable the canvas path. |
| Keep public claims bounded | Content links directly to the `JasonTM17` GitHub account and selected repositories. |
| Let visitors ask portfolio questions safely | A grounded assistant retrieves verified public facts server-side before calling DeepSeek. |

## Functional requirements

1. Show the public name Nguyen Son, a student Software Engineer / DevOps learning statement, a learning/feedback invitation, focus areas, and a GitHub profile link.
2. Provide in-page navigation to Work, Archive, Principles, and About without a sticky header obscuring target headings.
3. Render the selected work from typed static data: FoodFlow, Money Management, VN TravelAI, and AI-powered waste sorting.
4. Render all 19 verified public project records, refreshing public GitHub description/language/update metadata on page load while keeping a local fallback.
5. Open external GitHub destinations in a separate browsing context with `rel="noreferrer"`.
6. Give visitors a motion-reduction control when the operating system has not already requested reduced motion.
7. Always render the local studio artwork and an inline SVG studio fallback; add the Three.js canvas only when the current preference and forced-colors state allow it.
8. Once WebGL is ready, let a visitor opt into drag-to-rotate 3D interaction and reset it without making the visual necessary for content.
9. Offer a lower-right assistant that answers only portfolio questions through same-origin `/api/chat`, displays sources, and enforces a 75-question rolling 24-hour browser budget with a best-effort server abuse check.

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
| Public data resilience | The project archive remains complete from local typed data if GitHub API metadata is unavailable. |
| Assistant security | DeepSeek credentials stay in Vercel environment variables; client input is bounded; upstream error details and private data are not exposed. |
| Assistant scope | Retrieval is limited to verified student/profile and public-project fact chunks; transcripts are not persisted by the application. |

## Scope boundaries

- No user authentication, form submission, analytics integration, database layer, or persistent chat transcript is present in the repository source.
- The only application endpoint is `POST /api/chat`, which proxies a bounded DeepSeek request after local retrieval; it is not a general-purpose AI endpoint.
- Vercel hosts static assets and the chat function. A custom domain is not configured.
- A license decision is not represented by a license file in the current project layout.

## Acceptance evidence in the repository

| Concern | Existing automated evidence |
| --- | --- |
| Primary content and visual fallback | `src/app.test.tsx` renders the page, slogan, and studio fallback. |
| Local motion preference | `src/app.test.tsx` checks the motion button's pressed state and accessible name. |
| Student project archive and assistant launcher | `src/app.test.tsx` checks the 19-project archive heading, expanded repository-link count, and assistant entry point. |
| Assistant client | `src/features/portfolio-assistant/*.test.*` checks the anonymous session, 75-question budget, same-origin request, and grounded reply rendering. |
| Project-link ownership | `src/content/portfolio-data.test.ts` verifies GitHub host and `JasonTM17` repository paths. |
| Scene initialization and interaction | `src/components/studio-scene.test.tsx` verifies that a failing runtime leaves the static path in place and that a successful canvas exposes the interaction control. |
| Browser accessibility | `tests/portfolio-accessibility.spec.ts` uses axe, checks console errors, keyboard focus, 320px overflow, clear anchor positions, 3D interaction, assistant rendering, operating-system reduced motion, forced colors, and a mobile coarse-pointer case across two Chromium projects. |

## References

- [Codebase summary](./codebase-summary.md)
- [System architecture](./system-architecture.md)
- [Design guidelines](./design-guidelines.md)
- [Project roadmap](./project-roadmap.md)
