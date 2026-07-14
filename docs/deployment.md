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
| Environment variables | None required |

## Availability

This is a static Vite site. It has no sleeping application server, database, or background worker to keep alive. The production URL remains available while the Vercel project and account remain active.

## Updates and rollback

Vercel connected the GitHub repository during the production deployment. Pushes to the linked repository can create deployments through Vercel's Git integration. To roll back, promote a known-good deployment from the Vercel project dashboard or use `vercel rollback <deployment-url>` from an authenticated Vercel CLI.
