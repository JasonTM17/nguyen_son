# Deployment

## Platform

Vercel is the production target for this Vite project. The local Git remote is `JasonTM17/nguyen_son`; confirm any Git-integration deployment settings in the Vercel project before relying on automatic deploys.

## Production URL

https://nguyen-son-portfolio.vercel.app

## Build configuration

| Setting | Value |
| --- | --- |
| Framework | Vite (recorded in local Vercel project metadata) |
| Node.js | `24.x` in both Vercel project settings and `package.json` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Chat endpoint | `api/portfolio-assistant.mjs` serves the canonical `POST /api/portfolio-assistant` route |
| Public GitHub pins | `api/pinned-projects.mjs` serves `GET /api/pinned-projects`; no runtime credential required |
| Shared repository catalog | `api/public-projects.mjs` serves `GET /api/public-projects`; assistant uses the same service, no GitHub token |
| Owner administration | `/admin` and `/admin/` rewrite exactly to the SPA HTML; the browser canonicalizes to `/admin`. Old `/admin-cv` paths redirect. No wildcard rewrite captures `/api/*`. |

`vercel.json` sets noindex/no-referrer/frame-denial/no-store headers only on the admin HTML paths. Root portfolio metadata and indexing remain unchanged. Legacy `/#admin-cv` bookmarks are handled client-side because fragments are not sent to the server. The published CV and private storage do not depend on the UI route and must remain unchanged during a route-only release.

`api/portfolio-assistant.mjs` delegates to the tested handler in `api/chat.mjs`. Both source routes share it, but Vercel's older `/api/chat` mapping has returned 410; clients must use the canonical `/api/portfolio-assistant` route. Retrieval, public-context assembly, knowledge and rate limiting live under `server/`, bundled as internal dependencies rather than extra public routes.

## Production environment

The portfolio assistant's credentials belong in Vercel environment variables, never in source control or browser code. `DEEPSEEK_API_KEY` is required for live model replies; the other values below have source defaults or optional behavior.

| Variable | Purpose | Visibility |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | Authorizes the server-side DeepSeek request. | Sensitive Vercel secret. |
| `DEEPSEEK_BASE_URL` | Optional DeepSeek API base-URL override. | Server-side configuration; source otherwise uses its default URL. |
| `DEEPSEEK_MODEL` | Optional DeepSeek model override. | Server-side configuration; source otherwise uses its default model. |
| `PORTFOLIO_ASSISTANT_PROFILE` | Optional owner-supplied assistant profile facts. | Protected server configuration; source otherwise uses a public default profile and accepts only owner-approved facts. |

Do not prefix these values with `VITE_`; that would expose them to the browser bundle.
The server trims accidental leading or trailing whitespace from these values before use, but deployment owners should still paste secrets without surrounding spaces or line breaks.

## Availability

The featured pin endpoint reads the fixed public GitHub profile with a 7-second timeout and 1 MB response limit. Vercel caches fresh responses for 60 seconds and explicitly stale responses for 15 seconds. The browser refreshes every visible minute and on return; the checked-in public snapshot or last valid function-instance response covers upstream failure for at most 24 hours, with the actual verification time preserved. GitHub public HTML is not a stable API contract: unexpected markup produces an honest fallback/unavailable state, not a fabricated empty pin list. To refresh the seed after an extended outage or deliberate maintenance, regenerate it using `fetchPinnedProjects()` from `server/github-pins/profile.mjs`, then review before deployment. Do not put GitHub or Vercel credentials into the browser or the snapshot.

The shared catalog uses only the fixed JasonTM17 public owner API, a total 7-second deadline, at most ten 100-item pages and a 2MB aggregate payload cap. It never follows supplied URLs, redirects, homepage values or provider pagination URLs. Profile/portfolio, private, forked and disabled entries are excluded. Both services cache successful reads for 60 seconds per function instance, coalesce concurrent requests and back off failed reads for 15 seconds. Seed snapshots are never treated as a fresh upstream result. Generate/review `src/content/public-projects.json` through `fetchPublicCatalog()` before deployment; preserve actual timestamps.

Portrait and sharing assets are pre-generated with `node scripts/generate-media.mjs`; ImageMagick is not required on Vercel. The original PNG remains a fallback; AVIF/WebP are chosen by browser support and viewport density. Static sharing metadata always references the original production domain.

The archive permits up to 60 seconds of clock skew only for a newly received `stale:false` response. LocalStorage, stale responses and error recovery remain strict about future dates and the original 24-hour expiry. Receipt time never replaces verification time. Catalog and pin services keep their server-side timestamp rules unchanged.

Pin-list chat requests explicitly revalidate the public profile through the same bounded pin service. They bypass its fresh-cache hit, never its in-flight guard or15-second failed-read backoff. Failed revalidation invalidates the fresh-cache marker and returns only a saved/stale snapshot retaining its verification time, or unavailable after24h. These replies are generated deterministically from exact records without a model call/API key; they still consume the existing question allowance. Detailed general questions continue using the configured model with canonical source links from retrieval.

Static page assets have no always-running application server, database, or background worker to keep alive. The optional `/api/portfolio-assistant` function runs only for a chat request and needs no keep-alive job. Static delivery still depends on an active Vercel deployment and service availability; chat also depends on a valid server-side DeepSeek configuration and its upstream response. Language selection is client-side, and the selected assistant language travels only with a chat request.

## Updates and rollback

If the Vercel project has Git integration enabled, pushes to the linked repository can create deployments. Confirm the production branch and deployment settings in Vercel before relying on that workflow. To roll back, promote a known-good deployment from the Vercel project dashboard or use `vercel rollback <deployment-url>` from an authenticated Vercel CLI.
