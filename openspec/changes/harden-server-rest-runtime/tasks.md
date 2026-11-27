## 1. Cache headers

- [x] 1.1 Fastify plugin setting `cache-control: private, no-store` on `/rest` responses without one, registered in `config.ts`
- [x] 1.2 Specs: header on a `/rest` success and error, kept when a handler sets its own, absent outside `/rest`

## 2. Timeouts and budget

- [x] 2.1 `HttpClient`: default `timeout` from `HTTP_CLIENT_TIMEOUT_MS` (8000 ms), with a spec
- [x] 2.2 `/api` proxy: request timeout with the same budget (check the `@fastify/reply-from` option)
- [x] 2.3 `poll()` and `retry()`: `budgetMs` (20000 ms default), log `PAYMENT_POLL_BUDGET_REACHED`, specs with fake timers
- [x] 2.4 Pass the budget from `PaymentRedirectService` (status polling, DTMF retry)

## 3. Fallbacks

- [x] 3.1 `Server.ts`: JSON 404 for unknown `GET /rest/*` and missing `/assets/*`
- [x] 3.2 Check locally: `GET /rest/unknown` → 404 JSON, `GET /assets/missing.js` → 404, `GET /some/page` → `index.html`, existing routes unchanged

## 4. Image and env files

- [x] 4.1 `Dockerfile`: `WORKDIR /app/packages/server`, `CMD ["node", "dist/index.js"]`, no `.env` copy
- [x] 4.2 ~~`packages/server/.env`: remove `CLUBMED_API_KEY`~~ — dropped: public client key, also in the app bundles (design D6)
- [x] 4.3 Build the image locally and check it starts, answers `/rest/health` and stops on `SIGTERM` with the graceful log (exit `255` until tsedio/tsed#3548, see design)

## 5. Environment level

- [x] 5.1 `.gitlab/envs/.env.integration` and `.env.staging`: `NODE_ENV=production`, add `APP_ENV_LEVEL`; production gets `APP_ENV_LEVEL=production`
- [x] 5.2 `config/utils`: `envLevel` from `APP_ENV_LEVEL` (`local` by default), logged at bootstrap
- [x] 5.3 `GET /rest/version`: add `env_level`, update its spec and the OpenAPI schema

## 6. Verification

- [x] 6.1 `pnpm check`, `pnpm lint`, `pnpm fmt:check`, server tests with coverage thresholds
- [ ] 6.2 Update GPAY-423 with what is done here and link the MR
