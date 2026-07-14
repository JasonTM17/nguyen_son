---
phase: 3
title: 'Quality, publishing, and handoff'
status: in-progress
priority: P1
effort: 3h
dependencies:
  - 1
  - 2
---

# Phase 3: Quality, publishing, and handoff

## Overview

Validate both repositories, document the portfolio, perform a scoped review, then create and push the requested repositories under the verified `JasonTM17` GitHub account.

## Requirements

- Run fresh typecheck, unit-test, browser-accessibility-test, and production-build evidence for the portfolio.
- Run browser QA at desktop and narrow mobile sizes; verify links, focus order, reduced motion, no horizontal overflow, and the no-WebGL or motion-off fallback.
- Review changes for licensing, accidental personal data, resource cleanup, and content accuracy.
- Create/update documentation only in the portfolio repository because this is a new user-facing static product.
- Create only these remote repositories if they do not already exist: `JasonTM17/JasonTM17` for the profile README and `JasonTM17/nguyen_son` for the portfolio.
- Do not add a portfolio license, deployment claim, analytics, or domain without a user decision.

## Related Code Files

- Create: `D:\nguyen-son-portfolio\README.md`
- Create: `D:\nguyen-son-portfolio\docs\project-overview-pdr.md`
- Create: `D:\nguyen-son-portfolio\docs\code-standards.md`
- Create: `D:\nguyen-son-portfolio\docs\system-architecture.md`
- Create: `D:\nguyen-son-portfolio\docs\design-guidelines.md`
- Create: `D:\nguyen-son-portfolio\docs\project-roadmap.md`
- Create: `D:\nguyen-son-portfolio\plans\260714-nguyen-son-profile-and-portfolio\reports\qa-report.md`
- Modify: `D:\nguyen-son-portfolio\playwright.config.ts` and `tests\portfolio-accessibility.spec.ts` only if QA exposes a real test gap
- Modify: `D:\nguyen-son-profile\README.md` only if QA finds a factual or rendering error

## Implementation Steps

1. Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, and `npm run build` in the portfolio repository; install the project-owned Playwright browser only when required and fix actual failures instead of weakening tests.
2. Serve the built site and use browser automation to inspect desktop, 320px mobile, keyboard focus, system and local reduced-motion states, forced-colors CSS fallback, and fallback rendering.
3. Perform a scoped adversarial review of performance cleanup, semantic interactions, external links, licensing, and personal-data exposure.
4. Write concise setup, architecture, design, standards, PDR, and roadmap documentation from the implemented source.
5. Verify remote-repository availability, make focused commits using the account's configured identity, then create and push the requested repositories under `JasonTM17`.

## Success Criteria

- [ ] All portfolio verification commands exit successfully.
- [ ] Axe-assisted browser QA finds no serious accessibility issue, console error, or mobile overflow.
- [ ] README and docs accurately match the local source and contain no invented deployment claim.
- [ ] Both repositories are published under `JasonTM17`, and no remote related to TroyMitchell911 is created, changed, or pushed.

## Risk Assessment

- Browser tooling may be unavailable; retain command output and perform static inspection while reporting the limitation.
- A local Git identity may be missing or differ from the authenticated account; confirm it before committing and avoid inventing a misleading author.
- Documentation can drift; write it after the final implementation and validate referenced paths before completion.
