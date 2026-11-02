# Codebase Summary

## Purpose

This Vite + React + TypeScript portfolio supports English/Vietnamese with browser-local selection. Fixed public GitHub services provide a shared repository catalog and ordered pin feed to the page and assistant. Trusted local background remains separate from untrusted public project JSON before DeepSeek access. There is no database or persistent transcript.

## Top-level layout

| Path | Role |
| --- | --- |
| `index.html` | Initial English browser shell/metadata, Manrope and IBM Plex Mono font requests, theme color, and React mount element. |
| `public/` | Project-local hero artwork and the Shiba assistant SVG. |
| `src/` | Application source, styles, tests, typed content, and shared types. |
| `api/` | The canonical `POST /api/portfolio-assistant` Vercel route plus the compatible `/api/chat` entry point; both share one handler. |
| `server/portfolio-assistant/` | Internal retrieval knowledge, request parsing, best-effort rate limiting, and their tests; these files are bundled dependencies, not public Vercel routes. |
| `server/github-catalog/`, `server/github-pins/`, `server/public-feed-cache.mjs` | Fixed upstream readers, bounded verified snapshots, single-flight/freshness/backoff and timestamp-preserving fallback. Exposed through GET `/api/public-projects` and `/api/pinned-projects`. |
| `scripts/generate-media.mjs` | Reproducible ImageMagick AVIF/WebP, favicon and social-preview generation; authoring only. |
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
| `src/components/` | Header, language selector, footer, hero, selected work and decorative concept illustrations, searchable public archive, principles, motion control, studio artwork/fallback runtime, procedural icon objects, and cleanup helpers. |
| `src/content/` | Typed public links, localized focus areas/selected projects/principles, full public-project archive, and Vietnamese archive copy. |
| `src/i18n/` | Language context/provider plus English and Vietnamese interface-copy records. |
| `src/features/portfolio-assistant/` | Localized assistant UI, API client, anonymous budget/session storage, and types. |
| `src/hooks/` | Shared media-query support, reduced-motion and forced-colors state, plus public-GitHub repository refresh. |
| `src/types/` | Shared external-link, project, and public-GitHub repository shapes. |
| `src/styles/` | Base/layout/component styles, studio scene and interaction styles, content/archive styles, and modular assistant styles. |
| `src/test/setup.ts` | jsdom `matchMedia` test double. |
| `src/*.test.tsx`, `src/components/*.test.tsx`, and `src/content/*.test.ts` | Unit and content-contract coverage. |

## Page composition

`App` is wrapped in `PortfolioLanguageProvider` and renders the header, hero, ordered pins, public archive, principles, about, footer and Shiba assistant. The provider restores EN/VI and updates document/share metadata. Both feeds refresh through same-origin endpoints every visible minute/on return. Authoritative snapshots remove no-longer-public entries; fallback retains original verification time and expires after 24h. Reviewed project presentations, distinct SVG concepts and grouped technology aliases supplement canonical live identities. Only checked demo URLs receive actions; GitHub is the verified public connection path.

The hero contains `StudioScene`. The project-local high-detail portrait/desk artwork remains the primary image in normal and no-WebGL rendering; forced-colors uses the inline SVG fallback. When motion and color preferences allow it, a dynamically imported Three.js layer adds four procedural icons at the right edge. Direct drag/swipe and HTML left/reset/right controls rotate only this icon group, leaving the artwork unchanged. Runtime orchestration lives in `studio-scene-runtime.ts`, icon geometry in `studio-scene-objects.ts`, rotation behavior in `studio-scene-rotation-controller.ts`, and cleanup helpers in `three-resource-cleanup.ts`.

`PortfolioAssistant` keeps the current conversation only in React memory and a 75-question rolling browser budget in local storage. It localizes its launcher, panel, suggestions, statuses, and fallback errors; a language switch starts a fresh localized conversation. It then posts a bounded message/history plus the active `en`/`vi` value to `/api/portfolio-assistant`. The client budget stays separate from the server's best-effort IP throttle. The function validates input and language, retrieves matching knowledge chunks, directs model output to the selected language, adds owner-approved biography only for explicit profile questions, uses only Vercel environment variables for the DeepSeek request, returns generic failures, and does not persist messages.

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
