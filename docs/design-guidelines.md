# Design Guidelines

## Design intent

The interface uses a dark, high-contrast product-systems aesthetic: a warm amber action color, cool teal supporting color, restrained cards, large editorial headings, and a geometric Signal Lattice. The 3D scene supports the page; it is never the only way to understand the content.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `--canvas` | `#0a111c` | Page background. |
| `--surface` | `#111d2a` | Visual and card surfaces. |
| `--surface-raised` | `#17283a` | Raised surface token. |
| `--line` | `#314457` | Borders and dividers. |
| `--text` | `#f3f7fb` | Primary text. |
| `--muted` | `#b9c9d9` | Supporting copy. |
| `--accent` | `#ffbc71` | Primary actions and principle numbers. |
| `--accent-soft` | `#63d9c9` | Wordmark, tags, and supporting emphasis. |
| `--focus` | `#fce28d` | Visible keyboard focus outline. |

Use these custom properties rather than introducing near-duplicate colors. In forced-colors mode, base tokens resolve to system color keywords.

## Typography

- The font stack begins with Inter and falls back through common system sans-serif fonts.
- Headings use a 650 weight, tight letter spacing, and a 1.06 line height.
- `h1` scales with `clamp(3rem, 8vw, 6.35rem)`; `h2` and `h3` use smaller responsive clamps.
- Eyebrows and project indices are uppercase, compact, and teal to create hierarchy without adding decorative assets.

## Layout and responsive behavior

- The content width is `min(100% - 2rem, 1120px)` and the body has a 320px minimum width.
- The mobile layout is the baseline: header navigation occupies its own row, hero and about content stack, and project cards use an auto-fit grid.
- At 720px and above, the header becomes three columns; hero and about content become two columns; the footer aligns content across columns.
- Sections use responsive vertical spacing and line dividers to establish rhythm.

## Components

| Element | Guidance reflected in source |
| --- | --- |
| Header | Sticky, compact, anchored navigation, text wordmark, and motion control. |
| Primary actions | Amber-filled primary button; quiet action remains bordered. |
| Project cards | Bordered surface with project index, concise description, technology tags, and GitHub link. |
| Principle list | Ordered, ruled rows with amber sequence numbers. |
| Signal Lattice | Rounded framed surface with SVG baseline and optional canvas enhancement. |
| Footer | Short close, GitHub action, and static-portfolio note. |

## Accessibility and motion

- Maintain the 3px focus outline and skip-link reveal on focus.
- Keep the current 44px minimum sizing for navigation and text links; primary buttons are 48px high.
- Do not rely on hover for content or state.
- Reduced-motion CSS removes nonessential animation and transitions. The local page control can further reduce motion, but cannot override an operating-system reduced-motion preference.
- In forced-colors mode, use system color tokens and do not show the WebGL host.
- Keep the SVG fallback available. The decorative lattice must not carry product information unavailable elsewhere on the page.

## Style ownership

| File | Owns |
| --- | --- |
| `src/styles/base.css` | Tokens, browser baseline, typography baseline, focus, reduced-motion, and forced-colors rules. |
| `src/styles/layout.css` | Page shell, header, section, hero, about, footer, and responsive layout. |
| `src/styles/components.css` | Skip link, navigation, controls, typographic scale, actions, and focus-area pills. |
| `src/styles/signal-lattice.css` | SVG/canvas visual surface and fallback transition. |
| `src/styles/content-sections.css` | Project cards, tags, principle list, about/footer detail, local motion override, and forced-colors host rule. |

## References

- [System architecture](./system-architecture.md)
- [Code standards](./code-standards.md)
