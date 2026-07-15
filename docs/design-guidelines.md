# Design Guidelines

## Design intent

The portfolio uses a light editorial systems-studio aesthetic: warm ivory canvas, confident ink typography, cobalt/teal technical signals, and an amber action color. The hero pairs a large Nguyen Son identity with an original isometric studio artwork. The same hierarchy is available in English and Vietnamese through an explicit header control; it remains readable without 3D rendering.

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

- The primary stack begins with Manrope, then falls back through Inter and common system sans-serif fonts. `index.html` requests the Manrope weights used by the interface.
- IBM Plex Mono is the compact system-detail stack for the wordmark, eyebrows, indices, assistant eyebrow, and language selector; it falls back through common system monospace fonts.
- Display headings use an 800 weight, highly negative tracking, and tight line height to create the large editorial identity.
- The hero name scales with `clamp(4rem, 9.5vw, 9.15rem)`; its separate statement scales independently so it remains legible at small widths.
- Keep Vietnamese and English copy within the existing responsive containers; do not abbreviate labels solely to preserve an English line break.

## Layout and responsive behavior

- The content width is `min(100% - 2rem, 1320px)` and the body has a 320px minimum width.
- Mobile is the baseline: header navigation occupies a rounded second row, highlights the section currently in view, `EN`/`VI` and motion controls remain on the first row, hero and about content stack, and project cards use an auto-fit grid.
- At 740px and above, the header becomes three columns, the hero becomes a balanced copy/artwork grid, and the about/footer align across columns. Anchor targets reserve header clearance so an editorial heading is never clipped behind the sticky header.
- The hero visual keeps a generous responsive height so the studio reads as artwork instead of a small decorative tile.

## Components

| Element | Guidance reflected in source |
| --- | --- |
| Header | Sticky, compact wordmark, rounded anchor navigation with an active-section state, `EN`/`VI` pressed-button selector, and a motion control. |
| Hero | Large identity, factual engineering/DevOps slogan, feedback invitation, verified GitHub action, and selected-work anchor; its user-facing copy follows the selected language. |
| Systems Studio | Rounded ivory scene surface with a local owner portrait artwork, an optional Three.js depth layer, original inline SVG fallback, and small metadata labels. |
| 3D interaction | A visible only-when-ready control on the lower-left enables drag-to-rotate, explains the current action, and offers a reset without overlapping the assistant dock. |
| Primary actions | Amber-filled primary button; GitHub action remains quiet and bordered. |
| Project cards | Light raised surfaces with project index, category label, concise description, technology tags, and GitHub link. Vietnamese categories and descriptions come from maintained local copy; titles and repository links stay canonical. A restrained top rail and lift provide feedback on fine pointers. |
| Public archive | Smaller raised cards, a live-sync status line, and view-timeline entrance motion only where supported and motion is not reduced. All 19 Vietnamese archive descriptions are local so a GitHub metadata refresh cannot replace them; live language, topic, and update metadata can still appear. |
| Portfolio assistant | Lower-right navy 3D orb launcher that reveals its label on hover, keyboard focus, or open state; the panel stays warm and compact, distinguishes visitor/assistant bubbles, and keeps the 75-question budget visible. Its launcher, labels, suggestions, statuses, and fallback messages follow the selected language. |
| Principle list | Ordered, ruled rows with amber sequence numbers. |
| Footer | Short close, GitHub action, and static-portfolio note. |

## Accessibility and motion

- Maintain the 3px focus outline and skip-link reveal on focus.
- Keep navigation and text links at least 44px high; primary buttons are 50px high.
- Do not rely on hover for content or state.
- Keep the language selector as a labelled group of native buttons with an `aria-pressed` active state. Its accessible names must remain localized.
- Switching languages updates the root document language, title, and description; localized live-region/status text must remain understandable without visual context.
- Reduced-motion CSS removes nonessential transitions. The local control can reduce motion but cannot override an operating-system preference.
- In forced-colors mode, use system color tokens, hide the portrait and WebGL host, and retain the SVG fallback.
- The portrait artwork and Three.js enhancement are decorative. They must not carry information absent from semantic HTML.
- Keep the canvas opacity restrained so it enriches the studio rather than obscuring the owner artwork.
- Keep the portfolio assistant fully operable by keyboard: launcher, close button, suggestions, labeled text area, send button, and source labels are standard HTML controls/content.
- Assistant animation is a short panel entrance only; reduced-motion rules must continue to disable it.

## Style ownership

| File | Owns |
| --- | --- |
| `src/styles/base.css` | Tokens, browser baseline, typography baseline, focus, reduced-motion, and forced-colors rules. |
| `src/styles/layout.css` | Page shell, header, section, hero, about, footer, and responsive layout. |
| `src/styles/components.css` | Skip link, navigation, language and motion controls, typographic scale, actions, and focus-area pills. |
| `src/styles/studio-scene.css` | Studio surface, owner artwork, Three.js host, inline SVG fallback, metadata, and forced-colors behavior. |
| `src/styles/studio-scene-interaction.css` | Drag interaction cursor/state and the explicit 3D control. |
| `src/styles/content-sections.css` | Project cards, tags, principle list, about/footer detail, and local motion override. |
| `src/styles/public-project-archive.css` | Full public-project archive cards, live-sync status, and progressive entrance motion. |
| `src/styles/portfolio-assistant*.css` | Fixed launcher and compact assistant panel. |

## References

- [System architecture](./system-architecture.md)
- [Code standards](./code-standards.md)
