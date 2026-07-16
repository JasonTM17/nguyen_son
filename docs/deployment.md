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
| Chat endpoint | `api/chat.mjs` serves `POST /api/chat` |

Only `api/chat.mjs` lives in the Vercel `api/` convention directory. Retrieval, knowledge, rate limiting, and tests live under `server/portfolio-assistant/`, so Vercel bundles them as internal dependencies instead of publishing extra function routes.

## Production environment

The portfolio assistant's credentials belong in Vercel environment variables, never in source control or browser code. `DEEPSEEK_API_KEY` is required for live model replies; the other values below have source defaults or optional behavior.

| Variable | Purpose | Visibility |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | Authorizes the server-side DeepSeek request. | Sensitive Vercel secret. |
| `DEEPSEEK_BASE_URL` | Optional DeepSeek API base-URL override. | Server-side configuration; source otherwise uses its default URL. |
| `DEEPSEEK_MODEL` | Optional DeepSeek model override. | Server-side configuration; source otherwise uses its default model. |
| `PORTFOLIO_ASSISTANT_PROFILE` | Optional owner-supplied assistant profile facts. | Protected server configuration; source otherwise uses a public default profile and accepts only owner-approved facts. |

Do not prefix these values with `VITE_`; that would expose them to the browser bundle.

## Availability

Static page assets have no always-running application server, database, or background worker to keep alive. The optional `/api/chat` function runs only for a chat request and needs no keep-alive job. Static delivery still depends on an active Vercel deployment and service availability; chat also depends on a valid server-side DeepSeek configuration and its upstream response. Language selection is client-side, and the selected assistant language travels only with a chat request.

## Updates and rollback

If the Vercel project has Git integration enabled, pushes to the linked repository can create deployments. Confirm the production branch and deployment settings in Vercel before relying on that workflow. To roll back, promote a known-good deployment from the Vercel project dashboard or use `vercel rollback <deployment-url>` from an authenticated Vercel CLI.
