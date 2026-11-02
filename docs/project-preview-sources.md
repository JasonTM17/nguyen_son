# Project screenshots and editorial scope

The six current featured projects use actual interface screenshots committed in their public repositories, verified2026-11-01. These are repository captures, including local/demo builds; they do not prove current public uptime, real customer data or measured outcomes. Captions link to the full original at an immutable commit. These reviewed local images are now fallbacks for [automatic repository covers](./automatic-project-covers.md). Newly pinned repositories can supply their own README/tree images without a local mapping. If discovery and local fallback fail, the card uses neutral concept artwork. Dynamic source links follow the discovered image rather than an immutable local capture.

`src/content/project-previews.json` records exact repository identity, commit/path/SHA256, localWebPpath and bilingualalt. Source paths:

- Trash Sorter Pro: `docs/assets/screenshots/web-user-dashboard.png`
- BookStore: `docs/portfolio/previews/home.webp`
- JobHunter: `docs/assets/screenshots/jobhunter-home.jpg`
- LaptopShop: `docs/screenshots/home.png` (uppercase source `README.MD`).
- HealthCare: `docs/assets/repo-tours/public-01.png`
- CampusUTE: `docs/assets/showcase/public-home-vi.png`

Images are resized to at most1100px width and cropped to the top740px, metadata stripped and encoded WebPquality82. Cards crop to a consistent viewport; source links retain the full image. Combined assets are about305KB. Regenerate with `node scripts/generate-project-previews.mjs` and ImageMagick; source hashes must match. ImageMagick is not needed in production.

The owner explicitly confirmed on2026-11-01 that these six pinned projects are self-implemented personal projects. The contribution label applies only to those six exact identities. Functional descriptions remain supported by public README evidence; no invented employment, role allocation or measured results are added. Other catalog entries do not automatically receive the personal-project label.

`project-summaries.ts` has concise bilingual summaries reviewed against public descriptions, with CampusCore stack additionally checked against its README. Main pills show canonical language/topics/reviewedstack technologies. Original metadata remains searchable and available in a disclosure. Unknown repositories use a localized generic summary while retaining their source metadata.
