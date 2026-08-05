# ADAMO Pay

React 19 + TypeScript SPA (Vite) for real-time payments, organized by feature under `src/features/<name>/` with two layers per feature: `api/` (infrastructure) and `application/` (domain + UI).

## Conventions live in Claude Code plugins

This project's architecture, patterns, and code conventions are delivered by the team's **Claude Code plugins** from the `adamo-marketplace` — they are not duplicated in this repo:

- **`frontend-architecture`** (core) — feature scaffolding, domain modeling, the service layer, data-fetching states, forms, i18n, URL state, lazy loading, the `@adamosuiteservices/ui` component-library conventions, and the universal code conventions.
- **`authentication`** (opt-in) — install when the project needs login and permission-gated routes.

Each plugin ships **auto-invoking skills**: once the plugin is enabled, the relevant skill loads on its own for a matching task — there is nothing to wire up or list here. See the README for how to enable them.

**Breaking a convention is a decision to surface, not to make silently.** When a rule from a skill is genuinely impossible to satisfy, flag it and confirm the trade-off before proceeding — never apply an exception on your own. When in doubt, the more type-safe / more readable option wins even if it's more verbose.

## Project-specific notes

These are things the plugins can't know about this codebase.

### Five backends, five axios clients

`src/lib/api/api.ts` exports one client per microservice — pick the one that owns the endpoint:

| Client              | Owns                                                       |
| ------------------- | ---------------------------------------------------------- |
| `coreApi`           | payments, batches, accounts, dashboard, documents          |
| `beneficiariesApi`  | beneficiaries                                              |
| `analyticsApi`      | metrics, reports                                           |
| `realtimeApi`       | WebSocket gateway, batch uploads                           |
| `authApi`           | SSO/identity: `user/profile`, `auth/authorize`, `auth/refresh` (adamo-services-identity-microservice) |

The bare `api` export is **deprecated** — it aliases `coreApi` for services written before the split. Never reach for it in new code.

Each client is built by `createApiClient` in `src/lib/api/api.config.ts` and reads its base URL from `apiUrls` in `src/lib/env.ts`. In development, `vite.config.ts` proxies `/api/core`, `/api/beneficiaries`, `/api/analytics` and `/api/realtime` to the corresponding local ports.

### Auth is SSO-only, no static token

There is no bearer token in this app. Every client sends the suite's httpOnly session cookies (`withCredentials: true`); `src/lib/api/refresh-interceptor.ts` (attached to all 5 clients in `createApiClient`) silently refreshes an expired access token via `authApi`'s `/auth/refresh` and retries the original request, or redirects to the SSO login (`src/features/auth/api/services/auth-redirect.ts`) on any other 401. `src/features/auth/application/contexts/auth.context.tsx` (`AuthProvider`/`useAuth`) gates the whole app on `getProfile` + `auth/authorize` at bootstrap — see that file for the `allowedProducts` / redirect rules. `authApi` talks to a *different* response envelope than the other four clients (no `success` field, flat `errors: string[]`) — see `src/features/auth/api/services/identity-response.ts`, don't reuse `apiGet`/`apiGetRaw` from `http.service.ts` against it.

### Lint and type-check rules are relaxed on purpose

`eslint.config.js` and both `tsconfig.*.json` currently disable rules the conventions otherwise require — `@stylistic/indent`, `import/order`, `import/newline-after-import`, `@typescript-eslint/no-unused-vars`, `@stylistic/jsx-newline`, `noUnusedLocals`, `noUnusedParameters`, among others. This is a deliberate, temporary relaxation while a large refactor is in progress, not an oversight.

**Do not re-enable them, and do not mass-fix the code to satisfy the convention they encode.** Write new code the way the plugins describe; leave existing code alone unless the task is specifically about it.

### `src/features/common/` is flat

The plugins describe `common/` split into `api/` and `application/` like any other feature. Here it is flat — `components/`, `contexts/`, `hooks/`, `services/` — and 45 files import it at those paths. This is a known divergence to be migrated deliberately, not something to correct in passing.

### Miscellaneous

- `@/` aliases `src/`.
- `index.html` sets `<html data-theme="pay">`, selecting the `@adamosuiteservices/ui` product theme — see the package's `docs/colors-and-tokens.md`.
- Translations are still fetched at runtime from `public/locales/{{lng}}/{{ns}}.json` via `i18next-http-backend`, and a new namespace must be registered in the `ns` array of `src/lib/i18n/i18n.config.ts`.

## Commits and branches

Enforced by git hooks, so a violation fails the commit rather than surfacing in review:

- **Commit subject**: conventional commits, lower-case, no trailing period, **written in English** (`commitlint.config.js` rejects Spanish characters and common Spanish words).
- **Branch name**: `<type>/<kebab-case-description>` — e.g. `feat/beneficiary-bulk-import`. `main`, `dev` and `test` are exempt.
