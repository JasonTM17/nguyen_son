# Project Roadmap

## Current baseline

The source implements a bilingual Nguyen Son student portfolio with typed selected-work/archive data, browser-local English/Vietnamese selection, anchor navigation, a local motion preference, forced-colors handling, local visual fallbacks, and an optional fully procedural Three.js systems-studio diorama. The repository also contains unit, content-contract, browser accessibility, lint, typecheck, and build scripts.

## Near-term priorities

| Priority | Outcome | Evidence or action |
| --- | --- | --- |
| Release verification | Re-run the repository's typecheck, lint, unit, browser, and build commands on the final source. | `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run build` |
| Content accuracy | Keep English and Vietnamese project descriptions and links aligned with the linked public repositories. | Update the matching `src/content/` records and content test together. |
| Accessibility regression prevention | Preserve keyboard, 320px, bilingual metadata/assistant, forced-colors, system reduced-motion, and mobile coarse-pointer coverage when UI behavior changes. | Extend `tests/portfolio-accessibility.spec.ts` when a new behavior creates a relevant risk. |
| Visual performance | Keep the 3D scene optional, lazy-loaded, disposable, and secondary to HTML content. | Preserve the 45/30fps caps, compact mascot count, device-pixel-ratio limits, visibility pausing, fallback, and cleanup paths. |
| Portrait stewardship | Replace the local studio artwork only with the portfolio owner's consent and verify the updated asset at desktop and mobile sizes. | Review `public/nguyen-son-studio-avatar-clean.png` and rerun visual checks. |

## Publishing baseline

Vercel hosts the production static site at `https://nguyen-son-portfolio.vercel.app` and is linked to the GitHub repository. The build command, output directory, availability behavior, and rollback route are documented in [Deployment](./deployment.md). Before adding a custom domain, explicitly decide ownership, DNS, and rollback responsibility.

## Future product changes

Possible work should remain scoped and evidence-led:

1. Add or revise selected work only when the public repository supports the copy and technology tags.
2. Add a new section only with semantic headings, keyboard access, responsive rules, and a no-WebGL path where relevant.
3. Add richer visuals only when they preserve the current motion, forced-colors, local-artwork, and cleanup guarantees.
4. Add deployment or analytics only after an explicit product and privacy decision.

## References

- [Project overview and product requirements](./project-overview-pdr.md)
- [Code standards](./code-standards.md)
- [System architecture](./system-architecture.md)
- [Deployment](./deployment.md)
