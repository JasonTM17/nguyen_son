# Codebase Summary

## Purpose

This repository is a Vite + React + TypeScript implementation of the Nguyen Son student portfolio. Its public interface supports English and Vietnamese through browser-local selection. Most page content is authored locally, while a public GitHub metadata hook refreshes the 19-project archive. A small Vercel serverless endpoint grounds portfolio questions in local fact chunks before calling DeepSeek; it has no database or persistent transcript.

## Top-level layout

| Path | Role |
| --- | --- |
| `index.html` | Initial English browser shell/metadata, Manrope and IBM Plex Mono font requests, theme color, and React mount element. |
| `public/` | Project-local artwork used by the hero studio. |
| `src/` | Application source, styles, tests, typed content, and shared types. |
| `api/` | Vercel portfolio-assistant endpoint, retrieval knowledge, request parsing, and best-effort rate limiting. |
| `tests/` | Playwright browser accessibility coverage. |
| `package.json` | Scripts and package dependencies. |
| `vite.config.ts` | React plugin and Vitest configuration. |
| `playwright.config.ts` | Local Vite web server plus desktop Chromium and iPhone 13-configured mobile Chromium browser-test projects. |
| `plans/` | Local implementation-plan material; ignored from the public repository. |

Generated `dist/`, `node_modules/`, Playwright reports, test results, TypeScript build-info files, and local plans are ignored by `.gitignore`.

## Source layout

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` | React `StrictMode` bootstrap and modular stylesheet imports. |
| `src/app.tsx` | Page shell, skip link, major sections, shared motion-preference state, and assistant mount. |
| `src/components/` | Header, language selector, footer, hero, selected work, public archive, principles, motion control, studio fallback/runtime, procedural scene objects, and cleanup helpers. |
| `src/content/` | Typed public links, localized focus areas/selected projects/principles, full public-project archive, and Vietnamese archive copy. |
| `src/i18n/` | Language context/provider plus English and Vietnamese interface-copy records. |
| `src/features/portfolio-assistant/` | Localized assistant UI, API client, anonymous budget/session storage, and types. |
| `src/hooks/` | Shared media-query support, reduced-motion and forced-colors state, plus public-GitHub repository refresh. |
| `src/types/` | Shared external-link, project, and public-GitHub repository shapes. |
| `src/styles/` | Base/layout/component styles, studio scene and interaction styles, content/archive styles, and modular assistant styles. |
| `src/test/setup.ts` | jsdom `matchMedia` test double. |
| `src/*.test.tsx`, `src/components/*.test.tsx`, and `src/content/*.test.ts` | Unit and content-contract coverage. |

## Page composition

`App` is wrapped in `PortfolioLanguageProvider` and renders the header, hero, selected work, full public archive, principles, about section, footer, and fixed assistant. The provider restores a valid browser-local `en`/`vi` choice or derives a first-visit default from the browser locale, then updates the document language, title, and description. It supplies localized copy to the UI and selected/archive project-data helpers. `App` provides one `MotionPreference` result to the header control and hero visual. The selected-work section maps static project data into cards; the archive uses static verified records and overlays public GitHub metadata when the page-load request succeeds. Vietnamese archive categories/descriptions remain local.

The hero contains `StudioScene`. It always includes the project-local portrait artwork and inline SVG fallback. The Three.js runtime is dynamically imported only when the page is not in reduced-motion or forced-colors mode. On fine pointers it animates only the small computer-science icons at a low cadence while visible; coarse pointers remain static. After the canvas is ready, an HTML control enables drag-to-rotate interaction and reset. Runtime code is isolated in `studio-scene-runtime.ts`, procedural primitives live in `studio-scene-objects.ts`, and resource disposal helpers live in `three-resource-cleanup.ts`.

`PortfolioAssistant` keeps the current conversation only in React memory and a 75-question rolling browser budget in local storage. It localizes its launcher, panel, suggestions, statuses, and fallback errors; a language switch starts a fresh localized conversation. It then posts a bounded message/history plus the active `en`/`vi` value to `/api/chat`. The client budget stays separate from the server's best-effort IP throttle. The function validates input and language, retrieves matching knowledge chunks, directs model output to the selected language, adds owner-approved biography only for explicit profile questions, uses only Vercel environment variables for the DeepSeek request, returns generic failures, and does not persist messages.

`use-media-query.ts` is the shared browser media-query adapter. It returns no match when `matchMedia` is unavailable and supports both modern event listeners and legacy `addListener`/`removeListener` media-query lists. Motion and forced-colors hooks are thin query-specific wrappers around it.

## Dependencies

| Group | Packages used |
| --- | --- |
| Runtime | `react`, `react-dom`, `three` |
| Build and type checking | `vite`, `@vitejs/plugin-react`, `typescript` |
| Unit tests | `vitest`, Testing Library, `jsdom` |
| Browser tests | `@playwright/test`, `@axe-core/playwright` |
| Linting | `eslint`, `typescript-eslint`, React Hooks and React Refresh ESLint plugins |

## Test coverage map

| Test file | Current assertion focus |
| --- | --- |
| `src/app.test.tsx` | Main content, bilingual switch/persistence and metadata, repository-link count, studio fallback, and local motion reduction. |
| `src/features/portfolio-assistant/*.test.*` | Assistant session/budget behavior, grounded client request/reply rendering, and selected-language UI/API behavior. |
| `src/components/studio-scene.test.tsx` | Static fallback behavior for initialization failure, reduced motion, unavailable `matchMedia`, WebGL context loss, and interaction control. |
| `src/components/three-resource-cleanup.test.ts` | Disposal of every completed Three.js resource. |
| `src/content/portfolio-data.test.ts` | GitHub host, `JasonTM17` repository paths, project-copy length, tag presence, and profile link. |
| `tests/portfolio-accessibility.spec.ts` | Axe serious/critical results, console errors, skip-link focus, 320px overflow, clear anchor targets, 3D interaction, English/Vietnamese assistant UI and request locale, system reduced motion, forced colors, WebGL context loss, and the mobile coarse-pointer case. |

## Related documentation

- [Project overview and product requirements](./project-overview-pdr.md)
- [Code standards](./code-standards.md)
- [System architecture](./system-architecture.md)
- [Design guidelines](./design-guidelines.md)
