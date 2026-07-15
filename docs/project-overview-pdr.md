# Project Overview and Product Requirements

## Overview

Nguyen Son Portfolio is a bilingual React portfolio for a student developer. It presents a concise introduction, selected and archived public repositories, learning principles, a GitHub profile link, and a grounded portfolio assistant in English and Vietnamese. It remains a single page, with one narrow Vercel serverless endpoint for assistant responses.

## Product goals

| Goal | Source-backed implementation |
| --- | --- |
| Present Nguyen Son's work clearly | Student-focused hero/about copy, four featured project records, and a complete 19-project archive. |
| Give the portfolio a distinctive personal identity | A large light-mode hero with a project-local 3D portrait studio and factual engineering/DevOps statement. |
| Serve English- and Vietnamese-speaking visitors clearly | An explicit `EN`/`VI` header selector, browser-local preference, localized page/interaction copy, and language-aware assistant responses. |
| Let visitors reach relevant sections quickly | Sticky anchor navigation plus a skip link. |
| Keep the portfolio usable without WebGL | HTML content, project-local artwork, and an SVG studio fallback render independently of the canvas. |
| Respect motion and high-contrast needs | System/local reduced-motion handling and forced-colors handling disable the canvas path. |
| Keep public claims bounded | Content links directly to the `JasonTM17` GitHub account and selected repositories. |
| Let visitors ask portfolio questions safely | A grounded assistant retrieves verified public facts server-side before calling DeepSeek. |

## Functional requirements

1. Show the public name Nguyen Son, a student Software Engineer / DevOps learning statement, a learning/feedback invitation, focus areas, and a GitHub profile link.
2. Provide an accessible `EN`/`VI` header selector. Save a valid choice in the browser; otherwise choose Vietnamese when the browser locale begins with `vi`, or English for every other locale.
3. Apply the selected language to user-facing page copy, navigation, actions, studio/motion interaction labels, and `html[lang]`, document title, and description after the client mounts.
4. Provide in-page navigation to Work, Archive, Principles, and About without a sticky header obscuring target headings.
5. Render the selected work from typed static data: FoodFlow, Money Management, VN TravelAI, and AI-powered waste sorting.
6. Render all 19 verified public project records. English can refresh public GitHub description/language/update metadata on page load while keeping a local fallback; Vietnamese keeps maintained local categories and descriptions while live language, topic, and update metadata can refresh.
7. Open external GitHub destinations in a separate browsing context with `rel="noreferrer"`.
8. Give visitors a motion-reduction control when the operating system has not already requested reduced motion.
9. Always render the local studio artwork and an inline SVG studio fallback; add the Three.js canvas only when the current preference and forced-colors state allow it.
10. Once WebGL is ready, let a visitor drag or swipe the decorative 3D icon layer within a restrained arc, keep the primary artwork visually unchanged, and provide keyboard-accessible rotate/reset controls.
11. Offer a lower-right assistant that answers only portfolio questions through same-origin `/api/chat`, displays sources, keeps its UI in the selected language, starts a fresh localized transient conversation after a language change, sends only a validated `en` or `vi` language value, and enforces a 75-question rolling 24-hour browser budget with a best-effort server abuse check.

## Non-functional requirements

| Area | Requirement reflected in source |
| --- | --- |
| Rendering | React 19 and Vite build a static client-side page; `package.json` declares Node `^20.19.0 || >=22.12.0`. |
| Type safety | TypeScript project references enable strict checks with unused locals and parameters rejected. |
| Accessibility | Semantic landmarks/headings, a skip link, visible focus, readable HTML content, and a no-WebGL visual path are present. |
| Localization | The UI uses browser-local `en`/`vi` selection rather than locale routes or server rendering. The selector uses native pressed buttons, and the active language updates document metadata and accessible interaction labels. |
| Typography | Manrope is the primary sans-serif stack; IBM Plex Mono is used for systems-style details and controls. |
| Motion | `prefers-reduced-motion` is a hard lower bound; the optional local setting can only reduce further motion. |
| High contrast | Forced-colors mode replaces CSS tokens with system colors, suppresses the WebGL host, and uses the SVG fallback. |
| Performance | The Three.js runtime is lazily imported; it renders only four small icons, caps rendering at roughly 45fps on desktop and 30fps on compact screens, uses capped device pixel ratios, and stops when offscreen or hidden. |
| Resource lifecycle | Scene setup failure and normal cleanup dispose Three.js resources and the renderer. |
| Asset privacy | The owner artwork is a local repository asset; no runtime remote portrait request occurs. |
| Public data resilience | The project archive remains complete from local typed data if GitHub API metadata is unavailable. Vietnamese archive categories/descriptions are always local; English may show live GitHub descriptions. |
| Assistant security | DeepSeek credentials stay in Vercel environment variables; client input and language are validated; upstream error details and private data are not exposed. |
| Assistant scope | Retrieval is limited to verified student/profile and public-project fact chunks; the system prompt directs output to the selected language, and transcripts are not persisted by the application. |

## Scope boundaries

- No user authentication, form submission, analytics integration, database layer, or persistent chat transcript is present in the repository source.
- The only application endpoint used by the client is `POST /api/chat`, which proxies a bounded DeepSeek request after local retrieval and validates `en`/`vi`; it is not a general-purpose AI endpoint.
- Vercel hosts static assets and the chat function. A custom domain is not configured.
- A license decision is not represented by a license file in the current project layout.

## Acceptance evidence in the repository

| Concern | Existing automated evidence |
| --- | --- |
| Primary content and visual fallback | `src/app.test.tsx` renders the page, slogan, and studio fallback. |
| Local motion preference | `src/app.test.tsx` checks the motion button's pressed state and accessible name. |
| Language selection | `src/app.test.tsx` checks Vietnamese switching, persisted preference, localized content, and `html[lang]`; `tests/portfolio-accessibility.spec.ts` covers the compact 320px Vietnamese flow and document metadata. |
| Student project archive and assistant launcher | `src/app.test.tsx` checks the 19-project archive heading, expanded repository-link count, and assistant entry point. |
| Assistant client and language contract | `src/features/portfolio-assistant/*.test.*`, `api/chat.test.mjs`, and `api/portfolio-assistant-rag.test.mjs` check the anonymous session, 75-question budget, selected-language request, Vietnamese UI/error behavior, language validation, and model guidance. |
| Project-link ownership | `src/content/portfolio-data.test.ts` verifies GitHub host and `JasonTM17` repository paths. |
| Scene initialization and interaction | `src/components/studio-scene.test.tsx` verifies fallback behavior and accessible controls; Playwright verifies a direct drag changes both model axes, reset restores the rest angle, and mobile retains vertical touch scrolling. |
| Browser accessibility | `tests/portfolio-accessibility.spec.ts` uses axe, checks console errors, keyboard focus, 320px overflow, clear anchor positions, 3D interaction, assistant rendering, operating-system reduced motion, forced colors, and a mobile coarse-pointer case across two Chromium projects. |

## References

- [Codebase summary](./codebase-summary.md)
- [System architecture](./system-architecture.md)
- [Design guidelines](./design-guidelines.md)
- [Project roadmap](./project-roadmap.md)
