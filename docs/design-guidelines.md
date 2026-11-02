# Design Guidelines

## Design intent

The portfolio uses a light editorial systems-studio aesthetic: warm off-white canvas, navy typography and actions, muted teal details, illustrated selected-work cards, a sage principles panel, and a dark contact footer. The hero pairs a large Nguyen Son identity with the original isometric studio artwork. The same hierarchy is available in English and Vietnamese through an explicit header control; it remains readable without 3D rendering.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `--canvas` | `#f7f5ef` | Page background. |
| `--paper` | `#fffdf8` | Light elevated surfaces. |
| `--surface` | `#fffefa` | Project-card surface. |
| `--surface-tint` | `#eeeee6` | Muted surface tint. |
| `--ink` | `#15213e` | Primary text. |
| `--muted` | `#59637a` | Supporting copy. |
| `--line` | `#dcded4` | Borders and dividers. |
| `--indigo` | `#273d7c` | Structural 3D and navigation emphasis. |
| `--cobalt` | `#3e62bd` | Secondary interaction emphasis. |
| `--teal` | `#247668` | Statement, links, labels, and system signals. |
| `--amber` | `#ed9a45` | Artwork and assistant send action. |
| `--focus` | `#c06000` | Visible keyboard focus outline. |

Use these custom properties rather than introducing near-duplicate colors. In forced-colors mode, base tokens resolve to system color keywords.

## Typography

- The primary stack begins with Manrope, then falls back through Inter and common system sans-serif fonts. `index.html` requests the Manrope weights used by the interface.
- IBM Plex Mono is the compact system-detail stack for the wordmark, eyebrows, indices, assistant eyebrow, and language selector; it falls back through common system monospace fonts.
- Display headings use an 800 weight, restrained negative tracking, and a 1.12 line height to preserve Vietnamese diacritics.
- The hero name scales with `clamp(3.1rem, 6.8vw, 6.3rem)`; its separate statement has a wider readable measure and scales independently.
- Keep Vietnamese and English copy within the existing responsive containers; do not abbreviate labels solely to preserve an English line break.

## Layout and responsive behavior

- The desktop content width is `min(100% - 3rem, 1240px)`; below 740px it uses 1rem side gutters. The body has a 320px minimum width.
- Mobile is the baseline: header navigation occupies a rounded second row, highlights the section currently in view, `EN`/`VI` and motion controls remain on the first row, hero and about content stack, and featured cards use one column.
- At 740px and above, the hero becomes a balanced copy/artwork grid, featured cards use two columns, and about/footer align across columns. The header remains two rows on tablets and becomes three columns at 1100px. Anchor targets reserve header clearance.
- The hero visual keeps its original `clamp(27rem, 56vw, 43rem)` height and slightly larger desktop column so the studio reads as artwork instead of a small decorative tile. Its warm ivory frame uses a restrained 0.85rem radius; preserve this presentation when refreshing the surrounding UI. On narrow screens, hide the decorative metadata pills so they do not cover the portrait's face.

## Components

| Element | Guidance reflected in source |
| --- | --- |
| Header | Sticky, compact wordmark, rounded anchor navigation with an active-section state, `EN`/`VI` pressed-button selector, and a motion control. |
| Hero | Large identity, factual engineering/DevOps slogan, feedback invitation, verified GitHub action, and selected-work anchor; its user-facing copy follows the selected language. |
| Systems Studio | Rounded ivory scene surface with the project-local high-detail studio artwork as the primary image, four restrained Three.js icons on the right edge, an inline SVG forced-colors fallback, and small metadata labels. |
| 3D interaction | Mouse drag or horizontal touch swipe rotates only the icon layer within a restrained arc; the portrait artwork is never warped or replaced. A compact only-when-ready icon toolbar has 44px rotate/reset targets and an information disclosure for instructions. Localized accessible names, inset keyboard focus, and Escape-to-close help keep it operable without covering the artwork with permanent text. |
| Primary actions | Navy primary button; GitHub action remains quiet and bordered. Footer action uses a light sage fill. |
| Project cards | Preserve actual GitHub pin order and exact owner/repository identities. Reviewed projects have concise bilingual names, a real stack, individual concept illustrations and collapsed problem/build/exploration notes. Demo actions appear only for URLs checked during review; they are not ongoing health guarantees. Other pins retain public text and neutral art. Illustrations are decorative concepts, not screenshots. |
| Public archive | Six initial cards and six more per click. Search includes every record and broader topics, with unaccented Vietnamese support. Technology options use canonical aliases/casing and language/framework/data/tool groups. Group filter/reset with a reserved reset slot so selecting technology does not move controls. Reset focuses search. Repository data refreshes from the shared server endpoint every visible minute, with actual verification times preserved. |
| Portfolio assistant | Navy rounded launcher with an original orange Shiba SVG, cream muzzle, friendly eyes and teal bandana; name “Trợ lí AI”. Mobile keeps a 56px target, revealing the label on focus or open state. Panel appears above the launcher and preserves chat behavior and localization, with limit status only when exhausted. No unverified online/live badge. |
| Principle list | Ordered, ruled rows with teal numbers inside a sage panel; two-column composition on desktop. |
| Footer | Rounded dark surface, short close, high-contrast GitHub action, and static-portfolio note. |

## Accessibility and motion

- Maintain the 3px focus outline and skip-link reveal on focus.
- Keep navigation and text links at least 44px high; primary buttons are at least 48px high.
- Do not rely on hover for content or state.
- Keep the language selector as a labelled group of native buttons with an `aria-pressed` active state. Its accessible names must remain localized.
- Switching languages updates the root document language, title, and description; localized live-region/status text must remain understandable without visual context.
- Reduced-motion CSS removes nonessential transitions. The local control can reduce motion but cannot override an operating-system preference.
- In forced-colors mode, use system color tokens, hide the portrait and WebGL host, and retain the SVG fallback.
- The portrait artwork and Three.js enhancement are decorative. They must not carry information absent from semantic HTML.
- Keep the portrait artwork visible when the optional canvas is healthy or unavailable. Forced-colors uses the inline SVG path instead.
- Keep the portfolio assistant fully operable by keyboard: launcher, close button, suggestions, labeled text area, send button, and source labels are standard HTML controls/content.
- Assistant plain-text replies preserve paragraph breaks and render numbered/bullet project lists as semantic lists with spacing. Model text remains escaped; HTML and Markdown links are never activated.
- Pinned inventory uses structured, exact source records instead of model prose. Each item has a44px canonical repository anchor, full owner/repository identity and optional language. Show original verification time and saved/unavailable wording when applicable. General answers expose validated repository source links beneath the answer; external model URLs never activate.
- Assistant motion is limited to a short panel entrance and the mascot's subtle transform-only float/blink; reduced-motion rules must continue to disable both.

## Style ownership

| File | Owns |
| --- | --- |
| `src/styles/base.css` | Tokens, browser baseline, typography baseline, focus, reduced-motion, and forced-colors rules. |
| `src/styles/layout.css` | Page shell, header, section, hero, about, footer, and responsive layout. |
| `src/styles/components.css` | Skip link, navigation, language and motion controls, typographic scale, actions, and focus-area pills. |
| `src/styles/studio-scene.css` | Studio surface, owner artwork, Three.js host, inline SVG fallback, metadata, and forced-colors behavior. |
| `src/styles/studio-scene-interaction.css` | Direct drag/swipe surface, touch-scroll preservation, cursor state, and accessible 3D control strip. |
| `src/styles/content-sections.css` | Project cards, tags, principle list, about/footer detail, and local motion override. |
| `src/styles/public-project-archive.css` | Full public-project archive cards, live-sync status, and progressive entrance motion. |
| `src/styles/portfolio-assistant*.css` | Fixed launcher and compact assistant panel. |

## References

- [System architecture](./system-architecture.md)
- [Code standards](./code-standards.md)
