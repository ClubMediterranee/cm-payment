## Why

A review of the deployed CAPS stack (CloudFront → ALB → one ECS task) against the server code (Jira GPAY-423) found
server-side gaps on the `/rest` part and the image. The infra side is handled in ClubMediterranee/infra#895; this
change fixes what belongs to `@clubmed/server` and its Docker image:

- `/rest` responses carry no `Cache-Control`: if a CDN cache were ever enabled, it would share one user's, locale's or
  issuer type's response with everyone.
- Outgoing calls (axios to the Club Med API, `/api` proxy) have no timeout, and the `payment_redirect` polling and the
  DTMF retry can wait `attempts × delay` set in Directus: past CloudFront's 30 s origin timeout the customer gets a
  504 while Node keeps working.
- Unknown `GET /rest/...` and missing `/assets/...` files are answered `200 index.html` by the SPA fallback, which
  CloudFront can then cache under the asset URL.
- The image runs `pnpm` as PID 1, which may not forward `SIGTERM` to Node, so the graceful `platform.stop()` may never
  run on a deploy.
- The image copies the git-tracked `packages/server/.env` (local development defaults: staging URLs and the public
  client API key) into every environment, production included, so a value missing from the task falls back on staging.
- `NODE_ENV` is `integration` / `staging` at build time on those environments, while the server only switches to its
  production behaviour for `production`; there is no variable naming the environment level.

## What Changes

- `Cache-Control: private, no-store` on every `/rest` response that does not set its own.
- A default timeout on the shared HTTP client and on the `/api` proxy, below CloudFront's 30 s.
- A total time budget for the `payment_redirect` status polling and the DTMF redirect retry, whatever Directus sets.
- `404` JSON for unknown `GET /rest/*` and missing `/assets/*` instead of the SPA `index.html`.
- Docker image: Node as the main process (`node dist/index.js`), no `.env` copied.
- `NODE_ENV=production` for every deployed environment in CI, and a new `APP_ENV_LEVEL` variable
  (`integration` / `staging` / `production`, `local` by default) read by the server and returned by `GET /rest/version`.

## Non-goals

- Infra (CloudFront behaviours, health check path, WAF, logs, ECS env): ClubMediterranee/infra#895.
- Sizing and autoscaling (ops), SSM Parameter Store values. The API key of `packages/server/.env` stays: it is the
  public client key the app also ships in its bundles.
- Response compression, `TRUST_PROXY` hop count, the WAF bypass for the stress tests.

## Capabilities

### New Capabilities

- `server-runtime`: how the payment server behaves behind CloudFront and in its container: cache headers, timeouts,
  fallbacks, process and environment settings.

### Modified Capabilities

None.

## Impact

- `packages/server`: a Fastify plugin (cache header), `HttpClient`, `config/proxy`, `payment_redirect` utils,
  `Server.ts` fallbacks, `config/utils` (environment level), `VersionController`, specs.
- `Dockerfile`, `.gitlab/envs/.env.*`.
- Integration and staging switch to the production behaviour of the server (JSON logs, short stacks, no routes summary,
  hard failure when the `/mfe` remote is missing).
