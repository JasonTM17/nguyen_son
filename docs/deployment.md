# Deployment

## Platform

Vercel production deployment, linked to the GitHub repository `JasonTM17/nguyen_son`.

## Production URL

https://nguyen-son-portfolio.vercel.app

## Build configuration

| Setting | Value |
| --- | --- |
| Framework | Vite (auto-detected by Vercel) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Serverless function | `api/chat.mjs` |

## Production environment

The portfolio assistant's credentials are configured in the Vercel Production environment, never in source control or browser code.

| Variable | Purpose | Visibility |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | Authorizes the server-side DeepSeek request. | Sensitive Vercel secret. |
| `DEEPSEEK_BASE_URL` | DeepSeek API base URL. | Server-side configuration. |
| `DEEPSEEK_MODEL` | DeepSeek model identifier. | Server-side configuration. |
| `PORTFOLIO_ASSISTANT_PROFILE` | Owner-supplied assistant profile facts. | Protected server configuration; include only facts the owner intentionally wants the public assistant to share. |

Do not prefix these values with `VITE_`; that would expose them to the browser bundle.

## Availability

Static page assets have no sleeping application server, database, or background worker to keep alive. The production URL remains available while the Vercel project and account remain active. The optional `/api/chat` serverless function runs only for a chat request; it also needs no keep-alive job.

## Updates and rollback

Vercel connected the GitHub repository during the production deployment. Pushes to the linked repository can create deployments through Vercel's Git integration. To roll back, promote a known-good deployment from the Vercel project dashboard or use `vercel rollback <deployment-url>` from an authenticated Vercel CLI.
