---
phase: 1
title: Profile README
status: completed
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: Nguyen Son profile README

## Overview

Create a compact, original GitHub profile README and SVG banner for Nguyen Son. The profile repository is a new independent repository, not a clone or rewrite of another person's profile.

## Requirements

- Use **Nguyen Son** as the public display name; do not refer to Troy anywhere in user-facing content.
- Feature only verified public work: FoodFlow / FoodDelivery_App, Money_Management_App, VN_TravelAI, and App_AI_powered_waste_sorting.
- Link only the verified GitHub profile `https://github.com/JasonTM17` unless a further public link is verified.
- Do not add email, employer, availability, follower counts, generated stats, or unverified expertise claims.
- Use an original, locally committed SVG banner; do not use third-party image assets or the supplied reference repositories' assets.

## Related Code Files

- Create: `D:\nguyen-son-profile\README.md`
- Create: `D:\nguyen-son-profile\assets\nguyen-son-build-map.svg`
- Create: `D:\nguyen-son-profile\.gitignore`

## Implementation Steps

1. Create a compact original SVG banner with a descriptive text alternative and no third-party image assets.
2. Write a Markdown README with a concise hero, focus areas, selected work, and one verified profile link.
3. Ensure every project statement maps to a verified public repository.
4. Validate Markdown-relative asset references and SVG XML parsing locally.

## Success Criteria

- [ ] README renders without broken local-image references or character corruption.
- [ ] Every project statement maps to a linked public repository.
- [ ] No unverified private or professional claim appears.
- [ ] No other person's name, URL, assets, workflow, license, or Git history is included.

## Risk Assessment

- Profile data can change; avoid time-sensitive claims and hard-coded statistics.
- GitHub displays a profile README only from a public repository named exactly `JasonTM17`; this is a platform constraint, not the public display name.
