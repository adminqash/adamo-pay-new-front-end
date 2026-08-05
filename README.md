# ADAMO Pay — frontend

React 19 + TypeScript + Vite SPA for real-time integrated payments, organized by feature with a layered `api/`/`application/` structure per feature.

## Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 9

## Installation

```bash
npm install
cp .env.example .env   # then fill in the values
```

## Running

```bash
npm run dev        # dev server, exposed on the LAN (--host)
npm run build      # type-check + production build
npm run build:qa   # build in development mode
npm run build:prod # build in production mode
npm run preview    # preview the production build
npm run lint       # ESLint
npm run lint:fix   # ESLint --fix
```

## Backends

The app talks to four microservices. Each one has its own axios client in [`src/lib/api/api.ts`](src/lib/api/api.ts), built by `createApiClient` and pointed at a base URL resolved in [`src/lib/env.ts`](src/lib/env.ts):

| Client             | Owns                                                       | Variable                     | Local port |
| ------------------ | ---------------------------------------------------------- | ---------------------------- | ---------- |
| `coreApi`          | payments, batches, accounts, dashboard, documents, profile | `VITE_API_CORE_URL`          | 3600       |
| `beneficiariesApi` | beneficiaries                                              | `VITE_API_BENEFICIARIES_URL` | 3601       |
| `analyticsApi`     | metrics, reports                                           | `VITE_API_ANALYTICS_URL`     | 3602       |
| `realtimeApi`      | WebSocket gateway, batch uploads                           | `VITE_API_REALTIME_URL`      | 3603       |

The bare `api` export is **deprecated** — it aliases `coreApi` for services written before the split. Use the named client in new code.

Only `VITE_API_BASE_URL` is required; the four per-service variables are optional and each falls back to it, so a single-host backend needs just the base URL. All of them are validated as **absolute** URLs by the zod schema in [`src/lib/env.ts`](src/lib/env.ts) — a bare path fails at startup.

Pointed straight at the microservices, each one has to send back permissive CORS headers in development. To route everything through the dev server's origin instead, [`vite.config.ts`](vite.config.ts) proxies `/api/core`, `/api/beneficiaries`, `/api/analytics` and `/api/realtime` (this last one with WebSocket upgrade) to the ports above — set the variables to the proxy URLs, absolute as always:

```bash
VITE_API_CORE_URL=http://localhost:5173/api/core
```

Override the proxy targets with the `VITE_DEV_PROXY_*_TARGET` variables; see [`.env.example`](.env.example). Restart `npm run dev` after changing any of them.

## Architecture

Feature-based: each feature lives in `src/features/<name>/`, split into `api/` (DTOs, mappers, services) and `application/` (entities, commands, hooks, components, pages). Shared pieces live in `src/features/common/`; cross-cutting infrastructure (axios, React Query, i18n, money, realtime, env) in `src/lib/`. `@/` aliases `src/`.

```text
src/
├── features/
│   ├── <feature>/
│   │   ├── api/           # infrastructure — DTOs, mappers, services
│   │   └── application/   # domain + UI — entities, commands, hooks, components, pages
│   └── common/            # shared components, contexts, hooks, services
├── lib/                   # axios, react query, i18n, money, realtime, env
├── assets/
└── router.tsx
```

Translations live in `public/locales/<lng>/<ns>.json` and are fetched at runtime by `i18next-http-backend`; a new namespace also has to be added to the `ns` array in [`src/lib/i18n/i18n.config.ts`](src/lib/i18n/i18n.config.ts).

`index.html` sets `<html data-theme="pay">`, which selects the `@adamosuiteservices/ui` product theme — see that package's `docs/colors-and-tokens.md` for how theming works.

## Commits and branches

Both are enforced by git hooks, so a violation fails the commit instead of surfacing in review.

**Commit messages** follow [conventional commits](https://www.conventionalcommits.org/), lower-case, no trailing period, and **written in English** — [`commitlint.config.js`](commitlint.config.js) rejects Spanish characters and common Spanish words.

```text
feat: add beneficiary bulk import
fix(batches): keep the pager visible while refetching
```

**Branch names** follow `<type>/<kebab-case-description>`, with the same type list. `main`, `dev` and `test` are exempt.

```text
feat/beneficiary-bulk-import
fix/batch-pager-flicker
```

## Documentation for AI agents & contributors

Architecture, patterns, and code conventions come from the team's **Claude Code plugins** in the `adamo-marketplace` — not from files in this repo. Each plugin's skills are self-describing (their `description` says when they apply) and **auto-invoke** on a matching task once the plugin is enabled, so there's nothing to open or copy. [`CLAUDE.md`](CLAUDE.md) holds only what's specific to this project: the four API clients, the deliberately relaxed lint rules, and other local divergences.

- **`frontend-architecture`** — the core patterns and conventions (required); includes the `component-library` skill for `@adamosuiteservices/ui`.
- **`authentication`** — opt-in; enable when the project adds login / permission-gated routes.

### Enabling the plugins

This repo commits [`.claude/settings.json`](.claude/settings.json), which registers the marketplace and enables `frontend-architecture` automatically — just clone the repo, open it in Claude Code, and trust the workspace. A marketplace hosted on GitHub may prompt a one-time install per plugin the first time; it stays enabled afterward.

Add the opt-in plugins to a project when you need them:

```bash
claude plugin install authentication@adamo-marketplace
```

### Component library

`@adamosuiteservices/ui` ships its own AI-facing docs inside the installed package — check them before building any UI element from scratch:

- `node_modules/@adamosuiteservices/ui/llm.txt` — the full component list
- `node_modules/@adamosuiteservices/ui/docs/ai-guide.md`
- `node_modules/@adamosuiteservices/ui/docs/components/<component>.md`

## Deployment

[`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml) builds and ships to S3 + CloudFront on every push to `main` (production) and `develop` (development), then reports the result to Telegram.

The workflow writes only `VITE_API_BASE_URL` into the build's env file, so every client falls back to that single host in deployed environments. Splitting them per microservice means adding the `VITE_API_*_URL` secrets to the workflow.
