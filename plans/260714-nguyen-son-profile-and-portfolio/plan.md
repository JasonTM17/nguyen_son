---
title: Nguyen Son profile README and 3D portfolio
description: >-
  Create an original GitHub profile README and an accessible 3D portfolio for
  Nguyen Son using verified projects from the authenticated GitHub account.
status: in-progress
priority: P2
effort: 1.5d
branch: main
tags:
  - feature
  - frontend
  - docs
blockedBy: []
blocks: []
created: '2026-07-14T07:35:04.690Z'
createdBy: 'ck:plan'
source: skill
---

# Nguyen Son profile README and 3D portfolio

## Overview

Deliver two independent repositories for Nguyen Son:

1. A GitHub profile README in `D:\nguyen-son-profile`, prepared for the `JasonTM17/JasonTM17` profile repository required by GitHub.
2. An original static 3D portfolio in `D:\nguyen-son-portfolio`, prepared for the `JasonTM17/nguyen_son` repository.

The requested public-facing name is **Nguyen Son**. Project facts come from the currently authenticated `JasonTM17` GitHub account, whose public name is `Nguyen Tien Son`. The supplied Troy and David repositories are visual and quality references only; no identity, source code, assets, copy, or project claims are reused.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Profile README](./phase-01-profile-readme.md) | Completed |
| 2 | [3D portfolio](./phase-02-signal-ledger-portfolio.md) | Completed |
| 3 | [Quality and handoff](./phase-03-quality-and-handoff.md) | In Progress |

## Dependencies

- Phase 2 uses the verified project model established in Phase 1.
- Phase 3 validates both repositories after Phases 1 and 2.

## Verified Context and Scope

- Verified public projects selected for the portfolio are FoodDelivery_App, Money_Management_App, VN_TravelAI, and App_AI_powered_waste_sorting. Their public descriptions support the factual claims in the README and portfolio.
- Do not claim employer, seniority, availability, metrics, private contact details, social accounts, awards, or skills not demonstrated by the public work.
- `davidhckh/portfolio-2025` is research only. Its custom license prohibits substantial reuse; no source code, assets, layout, copy, shaders, or audio will be copied.
- The portfolio is a single static English page. HTML content is primary; WebGL is an optional original enhancement.
- The authenticated GitHub account is `JasonTM17`, not TroyMitchell911. The profile README repository must be named `JasonTM17` for GitHub to display it as a profile README; the separate portfolio repository is named `nguyen_son` as requested.

## Port Challenge Decisions

| Decision | Reference approach | Selected approach | Reason |
|---|---|---|---|
| Source reuse | Rich Vue 3D portfolio | Original implementation | Custom source license and author identity must be respected |
| Renderer | Vue plus direct Three scene | React plus direct Three scene | One small isolated scene; no R3F abstraction needed |
| Media | GLB, textures, video, audio | Primitive geometry and SVG only | Fast, owned, accessible, and easy to deploy |
| Data | Rich route content and media | Typed static content | No API, rate limit, or privacy dependency |
| Identity copy | Another creator's projects | Verified Nguyen Son projects | Accurate work history without invented claims |
| Publishing | Third-party repository | JasonTM17-owned repositories | Matches the currently authenticated account and user request |

## Acceptance Criteria

- Profile README is polished, factual, locally self-contained, and uses only Nguyen Son's verified public work.
- Portfolio builds and tests successfully, works at 320px and desktop widths, has keyboard navigation and visible focus, and preserves all meaningful information without WebGL or motion.
- The Three scene is original, lazy-loaded, lightweight, never auto-rotates, and is disposed on unmount.
- Repositories are published only under the verified `JasonTM17` account and use the requested public name Nguyen Son.

## Rollback

- Profile repository: revert the focused local commit or delete the newly created `JasonTM17/JasonTM17` repository from GitHub only if Nguyen Son requests it.
- Portfolio repository: revert the focused local commit or remove the newly created `JasonTM17/nguyen_son` repository only if Nguyen Son requests it.

## Red Team Review

| Finding | Disposition | Plan change |
|---|---|---|
| A manual browser pass cannot substantiate the no-serious-accessibility claim. | Accepted | Add Playwright plus axe-assisted browser coverage. |
| Visible-or-idle scene loading can initialize twice or leak cancelled work. | Accepted | Require a one-shot guard, idle fallback/cancellation, and import/renderer failure handling. |
| A local motion preference must not override an operating-system reduced-motion preference. | Accepted | System reduction is a hard lower bound; the local control can only reduce additional effects. |
| External project links and identity claims can drift. | Accepted | Verify public URLs and use no static achievement metrics, private data, or borrowed identity. |

## Validation Log

### Verification Results

- Tier: Standard.
- Verified account: `JasonTM17` with public name `Nguyen Tien Son`.
- Verified selected-project sources: FoodDelivery_App, Money_Management_App, VN_TravelAI, and App_AI_powered_waste_sorting.
- Toolchain evidence: Node 24.12.0 and npm 11.6.2 satisfy the current Vite baseline.
- Reference source: `davidhckh/portfolio-2025` is inspection-only and will not be copied.

### Whole-Plan Consistency Sweep

- Files reread: plan.md and all three phase files.
- Decision deltas checked: identity, public-project provenance, publication target, and no-reuse constraint.
- Unresolved contradictions: 0.
