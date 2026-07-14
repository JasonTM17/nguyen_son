---
phase: 2
title: Nguyen Son 3D portfolio
status: completed
priority: P1
effort: 8h
dependencies:
  - 1
---

# Phase 2: Nguyen Son 3D portfolio

## Overview

Build an original developer portfolio whose content remains fully readable without WebGL. The visual language is a warm technical signal lattice, not a derivative of the reference portfolio.

## Requirements

- Use Vite, React, TypeScript, and direct Three.js. Keep the app static; do not add routing, a server, auth, analytics, audio, GLB files, textures, or external GitHub API calls.
- Use typed static data for Nguyen Son's verified public projects and no unverified achievement metrics.
- Provide semantic landmarks, skip link, sequential headings, visible focus, keyboard-operable links/buttons, 44px targets, responsive layout, and reduced-motion support.
- Use an original primitive-based scene: one icosahedral core, instanced boxes, and line segments. Cap DPR at 1.25 on narrow screens and 1.5 otherwise.
- Load Three.js only once after the hero is visible or idle. Use a cancellable idle fallback where requestIdleCallback is unavailable, catch dynamic-import and renderer failures, and dispose renderer, geometries, materials, observers, timers, and animation frames on cleanup.
- Treat operating-system reduced motion as a hard lower bound. The local control may reduce extra effects but must not re-enable them against the system preference; storage access failures must safely fall back to system preferences.
- Render a CSS or SVG signal-lattice fallback for reduced motion, disabled animation, WebGL failure, and forced-colors environments; do not initialize the canvas in forced-colors mode.
- Use `rel="noreferrer"` on all external links opened in a new tab.

## Architecture

HTML content and CSS layout render first. A motion-preference hook controls a user toggle persisted locally. The scene component dynamically imports Three.js inside an effect, mounts a canvas marked `aria-hidden`, and owns all requestAnimationFrame, resize, visibility, pointer, and observer cleanup. The canvas never contains required copy or navigation.

## Related Code Files

- Create: `D:\nguyen-son-portfolio\package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `D:\nguyen-son-portfolio\src\main.tsx` and `src\app.tsx`
- Create: `D:\nguyen-son-portfolio\src\content\portfolio-data.ts` and `src\types\portfolio.ts`
- Create: `D:\nguyen-son-portfolio\src\components\site-header.tsx`, `hero-section.tsx`, `selected-work-section.tsx`, `principles-section.tsx`, `site-footer.tsx`
- Create: `D:\nguyen-son-portfolio\src\components\signal-lattice-scene.tsx`, `signal-lattice-fallback.tsx`, `motion-preference-toggle.tsx`
- Create: `D:\nguyen-son-portfolio\src\hooks\use-motion-preference.ts`
- Create: `D:\nguyen-son-portfolio\src\styles\base.css`, `layout.css`, `components.css`
- Create: `D:\nguyen-son-portfolio\src\content\portfolio-data.test.ts` and `src\app.test.tsx`
- Create: `D:\nguyen-son-portfolio\src\test\setup.ts`
- Create: `D:\nguyen-son-portfolio\playwright.config.ts` and `tests\portfolio-accessibility.spec.ts`

## Implementation Steps

1. Define package scripts for development, type checking, unit testing, browser accessibility testing, and production build; install only dependencies needed by the implementation.
2. Model verified profile links, focus areas, principles, and selected projects in typed static data.
3. Build HTML-first sections: header, hero, proof line, selected work, working principles, about, and contact footer.
4. Implement shared design tokens and mobile-first CSS split by base, layout, and components so individual stylesheets stay maintainable.
5. Implement the fallback lattice and lazy Three scene with bounded pointer tilt only for fine pointers, one-shot startup, and full cleanup.
6. Add unit coverage for project data integrity, primary content rendering, and motion-toggle/fallback behavior; add Playwright and axe coverage for semantic landmarks, focusable controls, reduced-motion mode, and 320px overflow.

## Success Criteria

- [ ] TypeScript has no implicit `any` escapes and source modules retain focused responsibilities.
- [ ] Every project card has an accurate title, description, tags, and external GitHub link.
- [ ] All meaningful content remains visible when motion is disabled or WebGL cannot initialize.
- [ ] The canvas is decorative, pointer-safe, and never blocks content or keyboard navigation.
- [ ] Mobile layout has no horizontal overflow at 320px.
- [ ] External project links open safely and the operating-system reduced-motion preference cannot be overridden.

## Risk Assessment

- WebGL may be unavailable or costly; fallback is part of the initial render rather than an error-only afterthought.
- Third-party dependencies can change; use current official Vite and Three.js documentation, a lockfile, and package scripts.
- Heavy components may affect initial render; dynamically import the renderer and avoid models, textures, post-processing, and continuous auto-rotation.
