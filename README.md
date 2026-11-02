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

The page contains a hero, anchor navigation that marks the section currently in view, selected-work cards following the owner's public GitHub pins, a live archive of public project repositories, learning principles, an about section, and links to the `JasonTM17` GitHub profile and repositories. The featured section uses `GET /api/pinned-projects`, which reads the public profile server-side, validates the pinned section, and preserves its displayed order, repository identities, descriptions and primary languages. It needs no GitHub token. The browser checks on page load, on return to the tab, and every visible minute; Vercel caches successful responses for 60 seconds. Normal refresh latency is about one to two minutes, not instantaneous.

The verified [`pinned-projects.json`](./src/content/pinned-projects.json) snapshot is an initial/failure fallback for at most 24 hours. Saved data is explicitly labeled and retains its actual verification time. Unexpected GitHub markup is treated as failure, while a verified profile without pins shows an empty state; popular repositories are never relabeled as pins. Public profile HTML can change, so the parser has a scrubbed fixture and fails closed if its selectors no longer match.

Archive editorial content remains in [`src/content/public-project-archive.ts`](./src/content/public-project-archive.ts). The archive and assistant share `GET /api/public-projects` and its fixed-owner server catalog service. The browser refreshes on load, on return and every visible minute. Public data has a 60-second server/CDN freshness window, single-flight reads and an explicitly stale recovery snapshot for at most 24 hours. Verification times are preserved. Private, forked, disabled, profile and portfolio-metadata repositories are excluded. Authoritative empty snapshots remove previous projects; errors are never relabeled empty. Catalog and pin timestamps are independent.

## Language and typography

The header provides explicit `EN` and `VI` controls. A valid saved choice takes priority; otherwise, a browser locale beginning with `vi` starts in Vietnamese and every other locale starts in English. Switching language updates the document `lang`, title, and description, along with navigation, actions, interaction labels, page copy, and the assistant UI.

Featured order and identities follow GitHub. Reviewed [`project-presentations.ts`](./src/content/project-presentations.ts) entries add concise bilingual names, summaries, stack, problem/build/exploration notes and demo URLs verified during review. Metadata is keyed by exact owner/repository so a foreign pin cannot borrow a local project's claims. Unknown pins use GitHub text and neutral artwork. New public archive repositories appear automatically; canonical repository links are retained. The grouped technology filter merges case/aliases through a small registry; broader topics remain searchable.

The interface uses Manrope for the primary sans-serif stack and IBM Plex Mono for system-style details such as the wordmark, labels, indices, and language selector.

The Systems Studio visual is an optional enhancement. Meaningful content does not depend on WebGL:

- The approved local portrait is delivered through responsive AVIF/WebP variants, with the original PNG fallback, preserving its layout and likeness. Run `node scripts/generate-media.mjs` with ImageMagick (WebP/AVIF support) to regenerate derivatives, favicon and the 1200×630 sharing image. ImageMagick is an authoring tool, not a Vercel runtime dependency.
- An inline SVG studio remains available for the system-color forced-colors presentation; the local portrait remains the normal no-WebGL and reduced-motion presentation.
- The Three.js runtime is dynamically imported only when motion is allowed and forced-colors mode is inactive.
- The runtime can start when the visual is near the viewport or during an idle-time fallback.
- The Three.js layer contains only four project-owned procedural icons: cloud deploy, terminal, code brackets, and database.
- Animation is capped at about 45fps on desktop and 30fps on compact screens, and pauses when the scene leaves the viewport or the tab is hidden.
- Dragging or swiping rotates only the icon layer inside a restrained arc; the high-detail studio artwork stays visually intact. `touch-action: pan-y` preserves vertical page scrolling. A compact icon toolbar provides rotate-left, reset, and rotate-right buttons with localized accessible names and 44px targets. Its information disclosure shows instructions on demand; Escape closes it and returns focus to the information control.
- Reduced-motion preferences and forced-colors mode keep the static path instead of creating a canvas.
- A lost WebGL context disposes and removes the canvas, then restores the static path.
- The visual is decorative and hidden from assistive technology; headings, links, the interaction button, and the motion control remain standard HTML controls.

The motion control stores an optional local preference in the browser. An operating-system reduced-motion preference remains the stricter setting and disables the local control.

## Portfolio assistant

The lower-right assistant is a grounded RAG-style guide for public portfolio questions. Its navy launcher features a project-owned orange Shiba SVG and the owner-selected name “Trợ lí AI”. On mobile it stays compact, revealing the label on keyboard focus or while open; the conversation panel appears above it. Pin-list questions bypass model generation: the server revalidates the fixed public profile and returns exact ordered identities, original verification time and canonical repository links. Changed/empty pins replace old inventory; stale recovery is labeled saved and unavailable feeds do not invent a list. General queries still retrieve relevant public catalog/pin facts before model generation, with safe source links derived from retrieval rather than model prose.

The client validates every returned repository/profile link and pin identity before rendering escaped text and anchors. Arbitrary model HTML, Markdown links, external hosts, URL credentials and query/fragment redirects do not become interactive links. Pin-list answers do not need a model API key but retain the same visitor/server question budget; detailed project answers still need the configured provider.

Public text is bounded and serialized as untrusted JSON in a user-role data message, never inserted into the privileged system prompt. Catalog and pin timestamps/statuses remain distinct. If feeds fail beyond their 24-hour recovery window, the assistant cannot claim a current project inventory and does not resurrect curated records as current. These controls reduce prompt-injection risk; they do not guarantee arbitrary model behavior.

- The browser never receives `DEEPSEEK_API_KEY`.
- Input is bounded and normalized; the endpoint accepts only `POST` and returns generic upstream failures.
- Visitors receive a 75-question browser budget per rolling 24-hour window, with a matching best-effort in-memory server check for the active function instance.
- The assistant UI follows the selected language. The client sends the selected `en` or `vi` value to the endpoint; the endpoint validates it and directs the model to answer in that language while retaining the same grounded portfolio-fact scope.
- Changing language starts a fresh localized assistant conversation, so messages and suggestions do not mix locales.
- Owner-approved biography is retrieved only when a visitor asks a profile-related question; unrelated project questions do not send it to the model.
- The assistant is intentionally limited to public portfolio facts. It does not expose credentials, private details, or hidden instructions.

Generic representative-project questions select a bounded number of current pins in displayed order, with public-catalog fallback when no pinned records are available. Exact pin inventories remain deterministic; named details, explicit technology/domain constraints and comparisons keep their existing retrieval route. Overview answers use concise numbered descriptions and canonical source links. This is bounded intent recognition, not exhaustive natural-language coverage.

## Accessibility checks

The source includes a skip link, visible `:focus-visible` styling, semantic sections and headings, 44px minimum interactive navigation/link targets, and static visual coverage. Browser tests check serious and critical axe findings, console errors, keyboard access to the skip link, 320px overflow, operating-system reduced motion, forced colors, WebGL context loss, and the mobile coarse-pointer path.

## CV management

The hero and footer share a published-CV metadata read and show the PDF download after the owner publishes a CV. The owner opens `/admin` directly; no public administration link is displayed. One account manages up to20private PDF versions, adds multiple PDFs per selection with sequential progress, renames/replaces/deletes each, and selects one public CV without rebuilding. Initial account creation requires a private expiring one-time link. See [CV management](./docs/cv-management.md) for private Blob configuration, session/security boundaries and recovery.

## Deployment

The production site is live on [Vercel](https://nguyen-son-portfolio.vercel.app). Static page delivery needs no keep-alive process; Vercel invokes the chat function only when a visitor sends a question. See the [deployment guide](./docs/deployment.md) for the verified build, environment, and rollback details.

## Project documentation

The visual refresh uses a warm off-white canvas, restrained teal accents, illustrated two-column selected-work cards, a searchable public archive, a sage principles section, and a dark contact footer. Pinned cards automatically discover repository screenshots from README images or a bounded repository-tree lookup. Cover and title links open the canonical repository. The six reviewed local screenshots remain failure fallbacks; otherwise decorative artwork is used. See [automatic covers](./docs/automatic-project-covers.md) for supported sources, refresh timing and limits. See [screenshot provenance](./docs/project-preview-sources.md). The archive starts with six cards and reveals six more per click, so the later sections stay easy to reach on mobile. Search still matches the entire catalogue, including undisplayed cards and current GitHub metadata, with support for Vietnamese without accents. A technology selector combines with search; reset clears both controls and returns keyboard focus to search. None of these controls changes the underlying feed.

The [GitHub synchronization proposal](./docs/github-project-sync-proposal.md) records the earlier audit. The shared catalog/pin retrieval is now implemented. Static canonical, Open Graph, Twitter card, favicon, robots and sitemap assets support link sharing and discovery; actual external crawler indexing is not guaranteed. The footer uses the verified public GitHub profile as its connection action; no unpublished CV or private contact address is invented.

- [Project overview and product requirements](./docs/project-overview-pdr.md)
- [Codebase summary](./docs/codebase-summary.md)
- [Code standards](./docs/code-standards.md)
- [System architecture](./docs/system-architecture.md)
- [Design guidelines](./docs/design-guidelines.md)
- [Project roadmap](./docs/project-roadmap.md)
- [Deployment guide](./docs/deployment.md)
