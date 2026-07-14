# Nguyen Son Portfolio

A static, single-page portfolio for Nguyen Son. It presents selected public work across full-stack products, real-time workflows, mobile applications, and applied AI systems.

The opening experience is an original light-mode systems studio: a local 3D portrait artwork based on the portfolio owner's supplied image, with a decorative, optional Three.js spatial overlay. It takes inspiration from the polish of modern creative portfolios without using another project's code, models, copy, or assets.

## Local setup

The project declares Node `^20.19.0 || >=22.12.0` in `package.json`.

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

The page contains a hero, anchor navigation, four selected-work cards, working principles, an about section, and links to the `JasonTM17` GitHub profile and repositories. Portfolio content is static typed data in [`src/content/portfolio-data.ts`](./src/content/portfolio-data.ts).

The Systems Studio visual is an optional enhancement. Meaningful content does not depend on WebGL:

- The local portrait artwork in `public/nguyen-son-studio-avatar-clean.png` remains visible without a canvas.
- An inline SVG studio remains available as a no-WebGL/forced-colors fallback.
- The Three.js runtime is dynamically imported only when motion is allowed and forced-colors mode is inactive.
- The runtime can start when the visual is near the viewport or during an idle-time fallback.
- On fine-pointer devices only, the decorative computer-science icons drift at a gentle 14fps while the scene is visible; they stop when it leaves the viewport or the tab is hidden.
- Reduced-motion preferences and forced-colors mode keep the static path instead of creating a canvas.
- A lost WebGL context disposes and removes the canvas, then restores the static path.
- The visual is decorative and hidden from assistive technology; headings, links, and the motion control remain standard HTML controls.

The motion control stores an optional local preference in the browser. An operating-system reduced-motion preference remains the stricter setting and disables the local control.

## Accessibility checks

The source includes a skip link, visible `:focus-visible` styling, semantic sections and headings, 44px minimum interactive navigation/link targets, and static visual coverage. Browser tests check serious and critical axe findings, console errors, keyboard access to the skip link, 320px overflow, operating-system reduced motion, forced colors, WebGL context loss, and the mobile coarse-pointer path.

## Deployment

The production site is live on [Vercel](https://nguyen-son-portfolio.vercel.app). It is a static site, so it does not require a keep-alive process. See the [deployment guide](./docs/deployment.md) for the verified build and rollback details.

## Project documentation

- [Project overview and product requirements](./docs/project-overview-pdr.md)
- [Codebase summary](./docs/codebase-summary.md)
- [Code standards](./docs/code-standards.md)
- [System architecture](./docs/system-architecture.md)
- [Design guidelines](./docs/design-guidelines.md)
- [Project roadmap](./docs/project-roadmap.md)
- [Deployment guide](./docs/deployment.md)
