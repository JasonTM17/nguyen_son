# System Architecture

## Overview

The portfolio is a React application built by Vite. The main page renders English/Vietnamese interface content, standard HTML controls, local visual assets, CSS, and an optional isolated Three.js depth layer. Vercel functions provide the assistant and a public GitHub-pin feed; no user authentication, database, or persistent chat store is added.

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
    A --> G[/api/public-projects shared catalog]
    G --> CACHE[Fixed-owner bounded GitHub API service]
    A --> PIN[/api/pinned-projects]
    PIN --> PROFILE[Fixed public GitHub profile]
    D --> G
    A --> P[Motion and forced-colors hooks]
    A --> V[Studio Scene component]
    V --> I[Local owner artwork]
    P --> V
    V --> F[Inline SVG fallback]
    V --> R[Lazy Three.js runtime]
    R --> C[WebGL canvas]
    A --> Q[Portfolio assistant UI]
    Q --> API[/api/portfolio-assistant Vercel function]
    API --> K[Local RAG knowledge chunks]
    API --> CACHE
    API --> PIN
    API --> DS[DeepSeek API]
```

## Rendering path

1. `index.html` supplies the initial English document metadata, Manrope/IBM Plex Mono font requests, and the `#root` mount point.
2. `src/main.tsx` mounts `App` in React `StrictMode` and imports base, layout, component, studio-scene, and content-section styles.
3. `PortfolioLanguageProvider` wraps the page. It supplies `en` or `vi` copy to the page, header controls, studio labels, and assistant.
4. `App` composes the page shell and shares its motion-preference result with the header control and hero visual.
5. When the active language changes, the provider updates `html[lang]`, `document.title`, and the description meta tag.
6. `StudioScene` always renders the local owner artwork and a decorative inline SVG. When allowed, it also creates the optional canvas host.
7. Selected work uses `use-pinned-github-projects.ts` and `/api/pinned-projects`. Server-only parsing validates the fixed public profile and preserves pin order. The archive uses `/api/public-projects` and its fixed-owner bounded API reader; this service also supplies assistant retrieval. Both browser feeds refresh each visible minute/on return, with 60-second server/CDN freshness, single-flight requests, failure backoff and <=24h timestamp-preserving fallback. Empty snapshots and unavailable feeds remain distinct. Catalog and pins are independent snapshots.
8. `PortfolioAssistant` is a fixed lower-right UI. It sends bounded text, a short conversation history, and the selected language to same-origin `/api/portfolio-assistant`; no DeepSeek credential is bundled into the Vite client.

## Language path

`src/i18n/portfolio-language.tsx` accepts only `en` and `vi`. A valid saved browser preference wins; if it is missing or unavailable, a browser locale beginning with `vi` selects Vietnamese and every other locale selects English. The header exposes the two values as `EN` and `VI` buttons.

General interface copy is held in `src/i18n/portfolio-copy-*.ts`. Exact-identity entries in `project-presentations.ts` provide reviewed bilingual names, summaries, stack and collapsed project notes for known projects. Other repositories retain their public descriptions and neutral art. `project-technologies.ts` canonicalizes case/aliases into grouped filter options; search retains all broader topics. Static metadata supports non-JavaScript sharing crawlers; the language provider also updates displayed metadata in-browser.

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
| External GitHub data | Server readers use only the fixed public owner API/profile, bounded time/payload/pagination and redirect rejection. Private/forked/disabled/metadata repositories are excluded. The browser validates same-origin feed identities, bounds and original verification times. No homepage or caller URL is fetched server-side. |
| Portfolio assistant | Same-origin `POST /api/portfolio-assistant` validates bounded input/language, obtains catalog and pins in parallel, selects relevant current project records or all displayed pins, and includes approved biography only for profile questions. Dynamic fields are serialized as untrusted JSON in a separate user-role data message, never privileged system content. Runtime authoritative empty/unavailable feeds do not resurrect curated project records as current. The system distinguishes freshness and independent timestamps. Generic upstream errors/refunds preserve the existing best-effort allowance. Source `/api/chat` shares the handler; use the canonical route because the provider's old route mapping has returned 410. |
| Assistant rate limit | The browser enforces 75 questions in a rolling 24-hour budget. The Vercel function mirrors a best-effort per-IP, per-function-instance check; it is not a durable account-level quota. |
| Pinned inventory answers | Pin-list intent uses a deterministic handler branch, explicit public-profile revalidation and exact ordered records rather than model generation. Revalidation bypasses fresh TTL only; shared in-flight/backoff and original <=24h fallback still apply. Structured reply data carries original timestamp/stale flag and canonical URLs. Unknown/expired/malformed feed yields no repo inventory and only the fixed public profile link. Model availability does not gate these factual replies; question budget still applies. |
| Assistant references | General answer links come from validated retrieved repository identities; pin cards and profile/repository anchors are validated again client-side (exact HTTPS GitHub origin/path, no credentials/query/fragment/encoded traversal). Model prose and raw HTML/Markdown are never linkified. Additive answer fields preserve the existing plain answer and source titles. |
| Backend/data storage | No database, user authentication, persistent transcript, or secret in the browser bundle. |

## References

- [Project overview and product requirements](./project-overview-pdr.md)
- [Codebase summary](./codebase-summary.md)
- [Code standards](./code-standards.md)
