# Codebase Summary

## Purpose

This repository is a Vite + React + TypeScript implementation of the Nguyen Son static portfolio. The application has no server-side source, API client, or data store; content is authored locally and GitHub links are ordinary external anchors.

## Top-level layout

| Path | Role |
| --- | --- |
| `index.html` | Browser shell, language, metadata, theme color, and React mount element. |
| `public/` | Project-local artwork used by the hero studio. |
| `src/` | Application source, styles, tests, typed content, and shared types. |
| `tests/` | Playwright browser accessibility coverage. |
| `package.json` | Scripts and package dependencies. |
| `vite.config.ts` | React plugin and Vitest configuration. |
| `playwright.config.ts` | Local Vite web server plus desktop Chromium and iPhone 13-configured mobile Chromium browser-test projects. |
| `plans/` | Local implementation-plan material; ignored from the public repository. |

Generated `dist/`, `node_modules/`, Playwright reports, test results, TypeScript build-info files, and local plans are ignored by `.gitignore`.

## Source layout

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` | React `StrictMode` bootstrap and the five stylesheet imports. |
| `src/app.tsx` | Page shell, skip link, major sections, and shared motion-preference state. |
| `src/components/` | Header, footer, hero, work, principles, motion control, studio fallback, studio runtime, procedural scene objects, and cleanup helpers. |
| `src/content/portfolio-data.ts` | Typed public links, focus areas, selected projects, and principles. |
| `src/hooks/` | Shared media-query support plus reduced-motion and forced-colors state. |
| `src/types/portfolio.ts` | Shared external-link and project shapes. |
| `src/styles/` | `base.css`, `layout.css`, `components.css`, `studio-scene.css`, and `content-sections.css`. |
| `src/test/setup.ts` | jsdom `matchMedia` test double. |
| `src/*.test.tsx`, `src/components/*.test.tsx`, and `src/content/*.test.ts` | Unit and content-contract coverage. |

## Page composition

`App` renders the header, hero, selected work, principles, about section, and footer. It provides one `MotionPreference` result to the header control and hero visual. The selected-work section maps static project data into cards; no runtime request is made for project content.

The hero contains `StudioScene`. It always includes the project-local portrait artwork and inline SVG fallback. The Three.js runtime is dynamically imported only when the page is not in reduced-motion or forced-colors mode. On fine pointers it animates only the small computer-science icons at a low cadence while visible; coarse pointers remain static. Runtime code is isolated in `studio-scene-runtime.ts`, procedural primitives live in `studio-scene-objects.ts`, and resource disposal helpers live in `three-resource-cleanup.ts`.

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
| `src/app.test.tsx` | Main content, slogan, repository-link count, studio fallback, and local motion reduction. |
| `src/components/studio-scene.test.tsx` | Static fallback behavior for initialization failure, reduced motion, unavailable `matchMedia`, and WebGL context loss. |
| `src/components/three-resource-cleanup.test.ts` | Disposal of every completed Three.js resource. |
| `src/content/portfolio-data.test.ts` | GitHub host, `JasonTM17` repository paths, project-copy length, tag presence, and profile link. |
| `tests/portfolio-accessibility.spec.ts` | Axe serious/critical results, console errors, skip-link focus, 320px overflow, system reduced motion, forced colors, WebGL context loss, and the mobile coarse-pointer case. |

## Related documentation

- [Project overview and product requirements](./project-overview-pdr.md)
- [Code standards](./code-standards.md)
- [System architecture](./system-architecture.md)
- [Design guidelines](./design-guidelines.md)
