# Code Standards

## Enforced toolchain rules

| Area | Current configuration |
| --- | --- |
| TypeScript | Strict mode, no unused locals, no unused parameters, React JSX transform, and bundler module resolution. |
| Linting | ESLint recommended JavaScript and TypeScript rules plus React Hooks rules; React Refresh export warnings remain enabled. |
| Unit tests | Vitest uses jsdom and `src/test/setup.ts`. |
| Browser tests | Playwright runs tests in `tests/` against a local Vite server with desktop Chromium and an iPhone 13-configured mobile Chromium project. |

Run the relevant command before changing a shared behavior:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

## TypeScript and React

- Use TypeScript for application code and keep strict compiler checks satisfied.
- Use named exports for reusable components and hooks; `App` is the current default export entry component.
- Model component props and shared records with explicit types. Existing component props use `readonly` fields.
- Use type-only imports when importing only types.
- Keep general interface copy in `src/i18n/portfolio-copy-*.ts`; keep localized project data in the existing `src/content/` helpers and preserve their `as const satisfies readonly PortfolioProject[]` contracts.
- Prefer small focused files. Existing component, hook, and stylesheet boundaries separate page composition, media preferences, scene runtime, and cleanup.

## File and naming conventions

| Artifact | Existing convention |
| --- | --- |
| React components | Lowercase kebab-case filenames in `src/components/`; exported component names use PascalCase. |
| Hooks | `use-` prefixed kebab-case filenames in `src/hooks/`; exported hooks use camelCase. |
| Styles | Concern-based lowercase kebab-case CSS files in `src/styles/`. |
| Tests | Co-located `*.test.ts(x)` unit tests and `*.spec.ts` browser tests in `tests/`. |
| Types | Shared shapes in `src/types/` with PascalCase type names. |

## Accessibility and interaction

- Preserve semantic landmarks, section headings, and the `#main-content` skip-link target.
- Preserve the visible `:focus-visible` outline and at least the current 44px minimum interactive target sizing for navigation and text links.
- Keep the `EN`/`VI` selector as labelled native buttons with an accurate `aria-pressed` state. A language change must continue to update `html[lang]`, title, description, and user-facing interaction labels together.
- Use native links for navigation and external destinations; retain `target="_blank"` with `rel="noreferrer"` where the current external-link pattern requires it.
- Keep query use behind `useMediaQuery` so absent `matchMedia` and legacy media-query listeners remain safe.
- Treat operating-system reduced motion as a stricter preference than the local toggle.
- Keep decorative canvas and SVG visuals out of the accessibility tree unless their role changes materially.

## Studio Scene rules

- Keep the local owner artwork and SVG fallback available independently of WebGL.
- Keep Three.js loading isolated behind the existing dynamic import and preference checks.
- Dispose event listeners, observers, geometries, materials, renderer context, and canvas during normal cleanup or setup failure.
- Keep the complete diorama procedural and project-owned; do not add remote model or texture dependencies for decorative details.
- Preserve direct group rotation, the presentation-safe isometric bounds, `touch-action: pan-y`, and the native rotate/reset button path together so mouse, touch, keyboard, vertical page scrolling, and visual quality remain supported.
- Avoid uncontrolled animation loops. Keep the current 45fps desktop and 30fps compact caps, reduced compact mascot count, device-pixel-ratio limits, and offscreen/hidden pausing.

## Styling rules

- Reuse CSS custom properties from `base.css` for palette and focus tokens.
- Keep Manrope as the primary sans-serif stack and IBM Plex Mono for systems-style labels/controls unless a source-verified design change updates both the font request and fallback stacks.
- Keep layout rules in `layout.css`, control and typography rules in `components.css`, visual-specific rules in `studio-scene.css`, and work/principle/about/footer rules in `content-sections.css`.
- Preserve the 740px desktop layout breakpoint and the 320px minimum viewport baseline unless a tested responsive change requires otherwise.
- Honor `prefers-reduced-motion` and `forced-colors` fallbacks when adding transitions, animation, or non-text visuals.

## Content changes

When changing selected work or archive descriptions, update the corresponding English/Vietnamese local records and accompanying content tests together. Keep public claims limited to what the linked public repository supports; do not add achievement metrics, contact details, availability, social accounts, or skills that are not represented by the current portfolio content.

## References

- [Codebase summary](./codebase-summary.md)
- [System architecture](./system-architecture.md)
- [Design guidelines](./design-guidelines.md)
