# Nguyen Son Portfolio

A Vite + React portfolio for Nguyen Son. It presents a student developer's public work across full-stack products, real-time workflows, mobile applications, applied AI systems, Java, and DevOps in English and Vietnamese.

The opening experience is an original light-mode systems studio built around the portfolio owner's high-detail local artwork. A restrained Three.js layer adds four animated computer-science icons at the right edge without replacing or distorting the portrait. Visitors can drag or swipe that icon layer, or use accessible rotate/reset controls. The visual remains optional when WebGL or motion is unavailable.

## Local setup

The project declares Node `24.x` in `package.json`, matching the linked Vercel project runtime.

```bash
npm install
npm run dev
```

Vite prints the local development URL when the server starts.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run the TypeScript project build, then create a Vite production build. |
| `npm run typecheck` | Run TypeScript project checks without formatted diagnostic output. |
| `npm run lint` | Lint TypeScript and TSX files with ESLint. |
| `npm run test` | Run Vitest once in the configured jsdom environment. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Run Playwright browser tests against the configured local Vite server, desktop Chromium, and mobile Chromium with iPhone 13 device settings. |

## Content and interaction model

The page contains a hero, anchor navigation that marks the section currently in view, four selected-work cards, a live archive of the owner's public project repositories, learning principles, an about section, and links to the `JasonTM17` GitHub profile and repositories. Editorial project content is typed in [`src/content/portfolio-data.ts`](./src/content/portfolio-data.ts) and [`src/content/public-project-archive.ts`](./src/content/public-project-archive.ts). The archive fetches every current public owner repository on page load, refreshes when a visitor returns to the tab, checks again every five minutes while visible, and retains the verified local catalogue plus the last valid browser cache if GitHub is unavailable or rate limited. Private, forked, disabled, profile, and portfolio-metadata repositories are excluded.

## Language and typography

The header provides explicit `EN` and `VI` controls. A valid saved choice takes priority; otherwise, a browser locale beginning with `vi` starts in Vietnamese and every other locale starts in English. Switching language updates the document `lang`, title, and description, along with navigation, actions, interaction labels, page copy, and the assistant UI.

Vietnamese selected-work and archive copy includes maintained local categories and descriptions for the curated catalogue. Newly public repositories appear automatically with their GitHub description or a localized learning-project fallback. Project titles and repository links remain canonical. English archive cards can use current public GitHub descriptions when that metadata request succeeds.

The interface uses Manrope for the primary sans-serif stack and IBM Plex Mono for system-style details such as the wordmark, labels, indices, and language selector.

The Systems Studio visual is an optional enhancement. Meaningful content does not depend on WebGL:

- The local portrait artwork in `public/nguyen-son-studio-avatar-clean.png` is the primary studio visual with or without a canvas.
- An inline SVG studio remains available for the system-color forced-colors presentation; the local portrait remains the normal no-WebGL and reduced-motion presentation.
- The Three.js runtime is dynamically imported only when motion is allowed and forced-colors mode is inactive.
- The runtime can start when the visual is near the viewport or during an idle-time fallback.
- The Three.js layer contains only four project-owned procedural icons: cloud deploy, terminal, code brackets, and database.
- Animation is capped at about 45fps on desktop and 30fps on compact screens, and pauses when the scene leaves the viewport or the tab is hidden.
- Dragging or swiping rotates only the icon layer inside a restrained arc; the high-detail studio artwork stays visually intact. `touch-action: pan-y` preserves vertical page scrolling, while three HTML buttons provide rotate-left, reset, and rotate-right access for keyboard and assistive-technology users.
- Reduced-motion preferences and forced-colors mode keep the static path instead of creating a canvas.
- A lost WebGL context disposes and removes the canvas, then restores the static path.
- The visual is decorative and hidden from assistive technology; headings, links, the interaction button, and the motion control remain standard HTML controls.

The motion control stores an optional local preference in the browser. An operating-system reduced-motion preference remains the stricter setting and disables the local control.

## Portfolio assistant

The lower-right assistant is a grounded RAG-style guide for public portfolio questions. Its dimensional Sơn AI mascot uses a small face, antenna, subtle float, and blink, while the always-visible two-line label identifies it as a portfolio chatbot before interaction. Motion reduction removes the decorative animation. Its server-side Vercel function retrieves relevant project facts from [`server/portfolio-assistant/portfolio-assistant-knowledge.mjs`](./server/portfolio-assistant/portfolio-assistant-knowledge.mjs), adds only owner-approved public profile configuration held in Vercel, supplies that context to DeepSeek, and returns a concise response plus its portfolio sources.

- The browser never receives `DEEPSEEK_API_KEY`.
- Input is bounded and normalized; the endpoint accepts only `POST` and returns generic upstream failures.
- Visitors receive a 75-question browser budget per rolling 24-hour window, with a matching best-effort in-memory server check for the active function instance.
- The assistant UI follows the selected language. The client sends the selected `en` or `vi` value to the endpoint; the endpoint validates it and directs the model to answer in that language while retaining the same grounded portfolio-fact scope.
- Changing language starts a fresh localized assistant conversation, so messages and suggestions do not mix locales.
- Owner-approved biography is retrieved only when a visitor asks a profile-related question; unrelated project questions do not send it to the model.
- The assistant is intentionally limited to public portfolio facts. It does not expose credentials, private details, or hidden instructions.

## Accessibility checks

The source includes a skip link, visible `:focus-visible` styling, semantic sections and headings, 44px minimum interactive navigation/link targets, and static visual coverage. Browser tests check serious and critical axe findings, console errors, keyboard access to the skip link, 320px overflow, operating-system reduced motion, forced colors, WebGL context loss, and the mobile coarse-pointer path.

## Deployment

The production site is live on [Vercel](https://nguyen-son-portfolio.vercel.app). Static page delivery needs no keep-alive process; Vercel invokes the chat function only when a visitor sends a question. See the [deployment guide](./docs/deployment.md) for the verified build, environment, and rollback details.

## Project documentation

- [Project overview and product requirements](./docs/project-overview-pdr.md)
- [Codebase summary](./docs/codebase-summary.md)
- [Code standards](./docs/code-standards.md)
- [System architecture](./docs/system-architecture.md)
- [Design guidelines](./docs/design-guidelines.md)
- [Project roadmap](./docs/project-roadmap.md)
- [Deployment guide](./docs/deployment.md)
