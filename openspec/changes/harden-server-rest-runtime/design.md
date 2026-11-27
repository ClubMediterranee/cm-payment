## Context

- Path: CloudFront (`/rest/*` and `/api/*` not cached, origin read timeout 30 s) → ALB (idle 60 s) → one ECS task,
  `node dist/index.js` started through `pnpm --filter @clubmed/server start:prod` (`cross-env NODE_ENV=production`).
- `HttpClient` (`infra/http/HttpClient.ts`) creates an axios instance with no `timeout` and `axios-retry` at 0 retries;
  `fetcher` builds every Club Med API call on it. `/api` is proxied by `@fastify/http-proxy` (`config/proxy`).
- `payment_redirect`: `poll()` checks the payment status `payment_status_poll_attempts` times every
  `payment_status_poll_delay_ms` (Directus settings, default 3 × 3000 ms); `retry()` replays the DTMF redirect request
  `dtmf_redirect_retry_attempts` times every `dtmf_redirect_retry_delay_ms`.
- `Server.ts` registers a `/mfe/*` 404 and, for `isApp` statics, a `/*` SPA fallback sending `index.html` with
  `no-cache, no-store`.
- `config/utils` loads `dotenv-flow` and exposes `isProduction = NODE_ENV === 'production'`.

## Decisions

### D1. `Cache-Control` on `/rest` with a Fastify `onSend` hook

A small Fastify plugin, registered with the other plugins in `config.ts`, sets `cache-control: private, no-store` on
responses whose path starts with `/rest` when the handler did not set one. It covers errors and every controller without
touching them. _Rejected: a Ts.ED decorator per endpoint_ (easy to forget on new endpoints).

### D2. Timeouts below CloudFront's 30 s

- `HttpClient`: `timeout` from the setting `HTTP_CLIENT_TIMEOUT_MS`, default `8000` ms, for every call. A timeout
  becomes the existing error path (`throwException`, gateway error).
- `/api` proxy: the same budget through the proxy's request timeout option (checked against the installed
  `@fastify/reply-from` version during implementation).

### D3. A time budget for `payment_redirect`

`poll()` and `retry()` take a `budgetMs` (default `20000`): no new attempt starts when `elapsed + delay` would pass it,
and the last result (or error) is returned. With the 8 s call timeout the worst case stays under 30 s (20 s of waiting
plus one call). Directus can still lower the attempts or delays; it can no longer push the request past CloudFront.
Each cut is logged (`event: PAYMENT_POLL_BUDGET_REACHED`) so the team sees when Directus values are too high.

### D4. SPA fallback: 404 for `/rest/*` and `/assets/*`

Same pattern as `/mfe/*` in `Server.ts`: `GET /rest/*` and `GET /assets/*` routes answering a JSON 404. Fastify's router
prefers the static and parametric routes of the controllers and statics over these wildcards, so only unknown paths or
missing files reach them.

### D5. Image: Node as PID 1, no `.env`

- Runtime stage: `WORKDIR /app/packages/server`, `CMD ["node", "dist/index.js"]`. `NODE_ENV=production` is already the
  image `ENV`; the server reads `./package.json` from its working directory, so the working directory must be the
  package.
- Drop `COPY packages/server/.env`: deployed environments get their values from the ECS task and the SSM Parameter
  Store.

### D6. Keep the tracked `.env` for local development (dropped)

The `CLUBMED_API_KEY` of `packages/server/.env` is the same client key the app ships in its browser bundles
(`VITE_*_API_KEY` in `packages/app/config/.env*`): a public key by design, not a secret. Removing it from the server
`.env` would not take it out of git and would only break local starts. The file stays as the local development
defaults; D5 keeps it out of the image, which is what mattered (deployed environments must not fall back on staging
values).

### D7. `NODE_ENV=production` everywhere, `APP_ENV_LEVEL` for the level

- `.gitlab/envs/.env.integration` and `.env.staging`: `NODE_ENV=production` (used as the image build argument), plus
  `APP_ENV_LEVEL` with the environment name. At build time `NODE_ENV` is only printed by the app's Vite config, so the
  bundles do not change.
- Server: the `APP_ENV_LEVEL` setting (`local` when unset), returned by `GET /rest/version` as `env_level` and logged
  at start (`SERVER_READY`). The image also gets it as a build argument from `.gitlab/envs`, so it is set before the
  ECS task does it (infra#895).
- Effect: integration and staging get the production behaviour (JSON logs, `maxStackSize`, no routes summary, a
  missing `/mfe` remote fails the start).

## Risks / Trade-offs

- [A slow but valid upstream call now fails after 8 s] → the value is a setting; the stress test and the logs give the
  real durations.
- [The budget cuts a payment confirmation that was about to succeed] → the user lands on the pending page as today when
  attempts run out; the log makes it visible.
- [Staging now fails to start when `/mfe` is missing] → wanted: same behaviour as production.

## Implementation notes

- **SPA fallback cache header (found while testing D4).** The fallback sets `no-cache, no-store, must-revalidate`,
  but `reply.sendFile` then replaced it with the mount's `maxAge` (`public, max-age=86400` on `/`), so `index.html`
  could be cached for a day. The fallback now calls `sendFile` with `cacheControl: false`; covered by `Server.spec.ts`.
- **`/api` proxy timeout (D2).** `@fastify/reply-from` 12 uses undici (300 s by default); the `timeout` reply option
  overrides its headers and body timeouts and answers 504.
- **Graceful stop (D5).** Checked on the built image: `node dist/index.js` is the container's main process, `docker
stop` makes the server log "Stop server gracefully...". The process still exits `255`: `PlatformBuilder.stop()` of
  Ts.ED 8.50 calls `closeServer` on the disabled HTTPS server and throws (tsedio/tsed#3548). Exit `0` waits for the
  Ts.ED fix.
- **Generated clients.** `VersionInfo` gains `env_level` in the `bff` clients of `sdk` and `app` (orval `--project
bff` against the local server only, so the Club Med API clients are not regenerated).
- **Coverage.** `Server.ts` had no spec; `Server.spec.ts` runs its hooks on a plain Fastify app. Thresholds raised by
  `autoUpdate`.

## Open Questions

- Budget and timeout values (`20000` / `8000` ms): to confirm with the team.
