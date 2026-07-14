# Project Roadmap

## Current baseline

The source currently implements a static Nguyen Son portfolio with typed selected-work data, anchor navigation, a local motion preference, forced-colors handling, an SVG fallback, and an optional Three.js Signal Lattice. The repository also contains unit, content-contract, browser accessibility, lint, typecheck, and build scripts.

## Near-term priorities

| Priority | Outcome | Evidence or action |
| --- | --- | --- |
| Release verification | Re-run the repository's typecheck, lint, unit, browser, and build commands on the final source. | `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run build` |
| Content accuracy | Keep project descriptions and links aligned with the linked public repositories. | Update `src/content/portfolio-data.ts` and its content test together. |
| Accessibility regression prevention | Preserve keyboard, 320px, forced-colors, system reduced-motion, and mobile coarse-pointer coverage when UI behavior changes. | Extend `tests/portfolio-accessibility.spec.ts` when a new behavior creates a relevant risk. |
| Visual performance | Keep the 3D layer optional, lazy-loaded, disposable, and secondary to HTML content. | Preserve the Signal Lattice preference and cleanup paths. |

## Publishing decision

GitHub Pages is not configured. Before any deployment work, choose and document a hosting provider, publication branch/path, build command, URL/domain, and rollback owner. Do not infer those choices from this repository.

## Future product changes

Possible work should remain scoped and evidence-led:

1. Add or revise selected work only when the public repository supports the copy and technology tags.
2. Add a new section only with semantic headings, keyboard access, responsive rules, and a no-WebGL path where relevant.
3. Add richer visuals only when they preserve the current motion, forced-colors, and cleanup guarantees.
4. Add deployment or analytics only after an explicit product and privacy decision.

## References

- [Project overview and product requirements](./project-overview-pdr.md)
- [Code standards](./code-standards.md)
- [System architecture](./system-architecture.md)
