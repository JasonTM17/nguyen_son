# System Architecture

## Overview

The portfolio is a React application built by Vite. The main page renders typed content, standard HTML controls, local visual assets, CSS, and an optional isolated Three.js depth layer. A single Vercel serverless function provides the portfolio assistant; it does not add authentication, a database, or a persistent chat store.

```mermaid
flowchart TD
    B[Browser] --> H[index.html]
    H --> M[src/main.tsx]
    M --> A[App and semantic page sections]
    M --> S[Modular CSS layers]
    A --> D[Typed static portfolio data]
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

1. `index.html` supplies document metadata and the `#root` mount point.
2. `src/main.tsx` mounts `App` in React `StrictMode` and imports base, layout, component, studio-scene, and content-section styles.
3. `App` composes the page shell and shares its motion-preference result with the header control and hero visual.
4. `StudioScene` always renders the local owner artwork and a decorative inline SVG. When allowed, it also creates the optional canvas host.
5. Selected work reads static records from `src/content/portfolio-data.ts`; the full project archive reads verified records from `src/content/public-project-archive.ts` and refreshes public metadata from GitHub on page load. A local cache is only a fallback for a failed or rate-limited GitHub request.
6. `PortfolioAssistant` is a fixed lower-right UI. It sends bounded text and a short conversation history to same-origin `/api/chat`; no DeepSeek credential is bundled into the Vite client.

## Preference and fallback path

`useMediaQuery` reads browser media queries with safe no-match behavior when `matchMedia` is unavailable and supports both modern and legacy media-query listeners. `useMotionPreference` combines `prefers-reduced-motion` with an optional local-storage setting. System reduction takes precedence and disables the local control. `useForcedColors` watches `(forced-colors: active)` through the same adapter.

`StudioScene` renders a local 3D portrait illustration, an inline SVG fallback, and an empty visual host. If either reduced motion or forced colors is active, no WebGL runtime starts. Forced-colors also hides the decorative portrait so the inline SVG uses system colors. Otherwise, an intersection observer and an idle-time task can initiate a dynamic import of the Three.js runtime. The visual layers remain decorative; the accessible interaction control is standard HTML and appears only after a canvas is ready.

## Three.js lifecycle

The runtime creates procedural primitive geometry, materials, lights, and a renderer only after the optional enhancement starts. It caps pixel ratio and uses a smaller composition below the mobile breakpoint. On fine-pointer devices, the decorative icons use a gentle 14fps timer-plus-render-frame cadence only while the scene is in view and the document is visible; coarse pointers keep the icons static. Once a visitor enables interaction, supported pointer devices can drag the studio to rotate the overlay and tilt the portrait; reset restores the rest position. Reduced-motion and forced-colors modes never start the runtime.

The scene is intentionally original: it uses procedural systems-console primitives and a project-owned portrait artwork rather than external 3D models. It does not load remote media or send the portrait to the browser at runtime.

On normal component cleanup it cancels scheduled frames, disconnects observers, removes event listeners, disposes geometries/materials, disposes and loses the renderer context, and removes the canvas. If setup throws, the same helper path disposes completed resources and the renderer before the error propagates to the component-level fallback path. If an already-running canvas emits `webglcontextlost`, the component uses the same cleanup path and returns to the static path.

## Data and trust boundaries

| Boundary | Behavior |
| --- | --- |
| Portfolio data | Local typed constants provide the verified 19-project fallback; public GitHub metadata refreshes on page load. |
| Owner artwork | Project-local static image; no runtime third-party asset request. |
| Browser preferences and budget | Media queries control visual modes; local storage holds the optional motion setting, public-repository cache, anonymous chat session, and 75-question browser budget. |
| External GitHub data | Browser fetch is restricted to the public `JasonTM17` owner repository endpoint; failures preserve the local archive. |
| Portfolio assistant | Same-origin `POST /api/chat` validates bounded input, retrieves relevant local portfolio chunks, and includes owner-approved biography only for an explicit profile question before calling DeepSeek with a server-side secret. Generic failures are returned without upstream detail. |
| Assistant rate limit | The browser enforces 75 questions in a rolling 24-hour budget. The Vercel function mirrors a best-effort per-IP, per-function-instance check; it is not a durable account-level quota. |
| Backend/data storage | No database, user authentication, persistent transcript, or secret in the browser bundle. |

## References

- [Project overview and product requirements](./project-overview-pdr.md)
- [Codebase summary](./codebase-summary.md)
- [Code standards](./code-standards.md)
