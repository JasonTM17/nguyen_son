# Design Guidelines

## Design intent

The portfolio uses a light editorial systems-studio aesthetic: warm ivory canvas, confident ink typography, cobalt/teal technical signals, and an amber action color. The hero pairs a large Nguyen Son identity with an original isometric studio artwork. It should feel carefully made and dimensional, while the page remains readable without 3D rendering.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `--canvas` | `#f4efe5` | Page background. |
| `--paper` | `#fffaf2` | Light elevated surfaces. |
| `--surface` | `#fffdf8` | Project-card surface. |
| `--surface-tint` | `#ece7dc` | Muted surface tint. |
| `--ink` | `#15213e` | Primary text. |
| `--muted` | `#59637a` | Supporting copy. |
| `--line` | `#c9c5bc` | Borders and dividers. |
| `--indigo` | `#273d7c` | Structural 3D and navigation emphasis. |
| `--cobalt` | `#3e62bd` | Statement and link emphasis. |
| `--teal` | `#198c87` | Wordmark, labels, and system signals. |
| `--amber` | `#ed9a45` | Primary actions and sequence numbers. |
| `--focus` | `#c06000` | Visible keyboard focus outline. |

Use these custom properties rather than introducing near-duplicate colors. In forced-colors mode, base tokens resolve to system color keywords.

## Typography

- The stack begins with Inter and falls back through common system sans-serif fonts.
- Display headings use an 800 weight, highly negative tracking, and tight line height to create the large editorial identity.
- The hero name scales with `clamp(4rem, 9.5vw, 9.15rem)`; its separate statement scales independently so it remains legible at small widths.
- Eyebrows, indices, and the wordmark use compact monospaced treatment for a systems-oriented counterpoint.

## Layout and responsive behavior

- The content width is `min(100% - 2rem, 1320px)` and the body has a 320px minimum width.
- Mobile is the baseline: header navigation occupies a rounded second row; hero and about content stack; project cards use an auto-fit grid.
- At 740px and above, the header becomes three columns, the hero becomes a balanced copy/artwork grid, and the about/footer align across columns.
- The hero visual keeps a generous responsive height so the studio reads as artwork instead of a small decorative tile.

## Components

| Element | Guidance reflected in source |
| --- | --- |
| Header | Sticky, compact wordmark, rounded anchor navigation, and a motion control. |
| Hero | Large identity, factual engineering/DevOps slogan, feedback invitation, verified GitHub action, and selected-work anchor. |
| Systems Studio | Rounded ivory scene surface with a local owner portrait artwork, an optional Three.js depth layer, original inline SVG fallback, and small metadata labels. |
| Primary actions | Amber-filled primary button; GitHub action remains quiet and bordered. |
| Project cards | Light raised surfaces with project index, category label, concise description, technology tags, and GitHub link. A restrained top rail and lift provide feedback on fine pointers. |
| Principle list | Ordered, ruled rows with amber sequence numbers. |
| Footer | Short close, GitHub action, and static-portfolio note. |

## Accessibility and motion

- Maintain the 3px focus outline and skip-link reveal on focus.
- Keep navigation and text links at least 44px high; primary buttons are 50px high.
- Do not rely on hover for content or state.
- Reduced-motion CSS removes nonessential transitions. The local control can reduce motion but cannot override an operating-system preference.
- In forced-colors mode, use system color tokens, hide the portrait and WebGL host, and retain the SVG fallback.
- The portrait artwork and Three.js enhancement are decorative. They must not carry information absent from semantic HTML.
- Keep the canvas opacity restrained so it enriches the studio rather than obscuring the owner artwork.

## Style ownership

| File | Owns |
| --- | --- |
| `src/styles/base.css` | Tokens, browser baseline, typography baseline, focus, reduced-motion, and forced-colors rules. |
| `src/styles/layout.css` | Page shell, header, section, hero, about, footer, and responsive layout. |
| `src/styles/components.css` | Skip link, navigation, controls, typographic scale, actions, and focus-area pills. |
| `src/styles/studio-scene.css` | Studio surface, owner artwork, Three.js host, inline SVG fallback, metadata, and forced-colors behavior. |
| `src/styles/content-sections.css` | Project cards, tags, principle list, about/footer detail, and local motion override. |

## References

- [System architecture](./system-architecture.md)
- [Code standards](./code-standards.md)
