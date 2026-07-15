# System Architecture

## Overview

The portfolio is a React application built by Vite. The main page renders typed English/Vietnamese content, standard HTML controls, local visual assets, CSS, and an optional isolated Three.js depth layer. A single Vercel serverless function provides the portfolio assistant; it does not add authentication, a database, or a persistent chat store.

```mermaid
flowchart TD
    B[Browser] --> H[index.html]
    H --> M[src/main.tsx]
    M --> A[App and semantic page sections]
    M --> S[Modular CSS layers]
    A --> L[Language provider and localized copy]
    L --> T[Document lang, title, and description]
    A --> D[Typed static portfolio data]
    L --> D
    A --> G[Public GitHub repository metadata]
    D --> G
    A --> P[Motion and forced-colors hooks]
    A --> V[Studio Scene component]
    V --> I[Local owner artwork]
    P --> V
    V --> F[Inline SVG fallback]
    V --> R[Lazy Three.js runtime]
    R --> C[WebGL canvas]
    A --> Q[Portfolio assistant UI]
    Q --> API[/api/chat Vercel function]
    API --> K[Local RAG knowledge chunks]
    API --> DS[DeepSeek API]
```

## Rendering path

1. `index.html` supplies the initial English document metadata, Manrope/IBM Plex Mono font requests, and the `#root` mount point.
2. `src/main.tsx` mounts `App` in React `StrictMode` and imports base, layout, component, studio-scene, and content-section styles.
3. `PortfolioLanguageProvider` wraps the page. It supplies `en` or `vi` copy to the page, header controls, studio labels, and assistant.
4. `App` composes the page shell and shares its motion-preference result with the header control and hero visual.
5. When the active language changes, the provider updates `html[lang]`, `document.title`, and the description meta tag.
6. `StudioScene` always renders the local owner artwork and a decorative inline SVG. When allowed, it also creates the optional canvas host.
7. Selected work reads static records from `src/content/portfolio-data.ts`; the full project archive merges curated records with a paginated public GitHub owner snapshot. It refreshes on page load, after the visitor returns to the tab, and every five minutes while visible. Local records and the last valid browser cache cover failed or rate-limited requests.
8. `PortfolioAssistant` is a fixed lower-right UI. It sends bounded text, a short conversation history, and the selected language to same-origin `/api/chat`; no DeepSeek credential is bundled into the Vite client.

## Language path

`src/i18n/portfolio-language.tsx` accepts only `en` and `vi`. A valid saved browser preference wins; if it is missing or unavailable, a browser locale beginning with `vi` selects Vietnamese and every other locale selects English. The header exposes the two values as `EN` and `VI` buttons.

General interface copy is held in `src/i18n/portfolio-copy-*.ts`. `src/content/portfolio-data.ts` supplies Vietnamese selected-work categories and descriptions, while `src/content/public-project-archive-vi.ts` supplies maintained Vietnamese copy for curated archive projects. `src/content/merge-public-project-archive.ts` converts previously unknown public repositories into localized project cards. English descriptions can be overlaid with live GitHub descriptions; maintained Vietnamese descriptions remain local.

When a visitor changes language, `PortfolioAssistant` clears its transient draft and message list, starts the matching localized welcome, and ignores a response from the previous conversation version.

## Preference and fallback path

`useMediaQuery` reads browser media queries with safe no-match behavior when `matchMedia` is unavailable and supports both modern and legacy media-query listeners. `useMotionPreference` combines `prefers-reduced-motion` with an optional local-storage setting. System reduction takes precedence and disables the local control. `useForcedColors` watches `(forced-colors: active)` through the same adapter.

`StudioScene` renders a local portrait illustration, an inline SVG fallback, and an empty visual host. If either reduced motion or forced colors is active, no WebGL runtime starts. Forced-colors also hides the decorative portrait so the inline SVG uses system colors. Otherwise, an intersection observer and an idle-time task can initiate a dynamic import of the Three.js runtime. A healthy transparent canvas overlays the portrait without replacing it; accessible rotate/reset controls remain standard HTML and appear only after the canvas is ready.

## Three.js lifecycle

The runtime creates only four procedural icon groups from boxes, spheres, cylinders, cones, and toruses: cloud deploy, terminal, code brackets, and database. The high-detail local artwork remains a separate DOM image beneath the transparent canvas. Rendering is capped at roughly 45fps on desktop and 30fps on compact screens, and it stops while offscreen or hidden. A dedicated rotation controller applies damped pointer/touch movement to the icon group, preserves vertical touch scrolling, and accepts rotate/reset events from the HTML control strip. Reduced-motion and forced-colors modes never start the runtime.

The scene is intentionally original: it combines project-owned local artwork with project-owned procedural icon geometry rather than external 3D models. It does not load remote media or send the portrait to a third-party service at runtime.

On normal component cleanup it cancels scheduled frames, disconnects observers, removes event listeners, disposes geometries/materials, disposes and loses the renderer context, and removes the canvas. If setup throws, the same helper path disposes completed resources and the renderer before the error propagates to the component-level fallback path. If an already-running canvas emits `webglcontextlost`, the component uses the same cleanup path and returns to the static path.

## Data and trust boundaries

| Boundary | Behavior |
| --- | --- |
| Portfolio data | Local typed constants provide the curated fallback; the current public GitHub owner snapshot controls the live archive after a successful sync. |
| Owner artwork | Project-local static image; no runtime third-party asset request. |
| Browser preferences, language, and budget | Media queries control visual modes; local storage holds the optional motion setting, selected `en`/`vi` language, public-repository cache, anonymous chat session, and 75-question browser budget. |
| Localized portfolio content | General UI copy is local to `src/i18n/`; selected-work and archive Vietnamese categories/descriptions are local typed content. No locale route, server-rendered locale, or remote translation service is used. |
| External GitHub data | Browser fetch is restricted to the public `JasonTM17` owner repository endpoint; failures preserve the local archive. |
| Portfolio assistant | Same-origin `POST /api/chat` validates bounded input and the `en`/`vi` language value, retrieves relevant local portfolio chunks, and includes owner-approved biography only for an explicit profile question before calling DeepSeek with a server-side secret. The system prompt requires replies in the selected language; the verified source titles/chunks remain local portfolio facts. Generic failures are localized and do not expose upstream detail. |
| Assistant rate limit | The browser enforces 75 questions in a rolling 24-hour budget. The Vercel function mirrors a best-effort per-IP, per-function-instance check; it is not a durable account-level quota. |
| Backend/data storage | No database, user authentication, persistent transcript, or secret in the browser bundle. |

## References

- [Project overview and product requirements](./project-overview-pdr.md)
- [Codebase summary](./codebase-summary.md)
- [Code standards](./code-standards.md)
