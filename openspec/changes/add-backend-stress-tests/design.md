## Context

`@clubmed/server` is a Ts.ED 8 app on Fastify, REST routes mounted under `/rest` (`src/config/config.ts`), port `8083`
locally (`PORT`), `8080` in `docker-compose.yml`.

`GET /rest/payment_config` (`PaymentConfigController`) returns `{ feature_flips, settings }`:

- `@Locale()` reads `accept-language` (falls back to the default locale), `@IssuerType()` reads `x-issuer-type`
  (`GM` by default, `400` when invalid).
- `PaymentConfigService.getPaymentConfig` → `PaymentConfigRepository.getConfigurations` →
  `DirectusClient.getConfigurations` (`readItems('caps_configurations')`), then resolves the overrides per
  locale/issuer.
- No `@UseCache` on this path today: every request reaches Directus.

## Goals / Non-Goals

**Goals:** validate Artillery on the stack, get a reproducible baseline (RPS, p50/p95/p99, errors) on a real business
endpoint, find where it breaks first (server CPU, Directus latency, Directus rate limit), define the conventions later
scenarios will follow.

**Non-Goals:** endpoints needing bookings, Club Med API or PSPs; server changes; CI integration; distributed load.

## Decisions

### D1 — Dedicated workspace package

`packages/stress-tests` (private, not built, not released). Keeps Artillery and its heavy dependency tree out of the
server package and of the Docker image. Alternative rejected: scripts inside `packages/server` (would pollute its deps
and its `test` script).

```
packages/stress-tests/
  package.json
  README.md
  config/environments.yml          # targets per environment
  data/payment-config-headers.csv  # locale × issuer type combinations
  scenarios/payment-config.yml     # first scenario
  reports/                         # gitignored JSON/HTML output
```

### D2 — First endpoint: `GET /rest/payment_config`

Chosen over the other business routes because it's the simplest one that is still business: called by every CAPS
form on load (so the highest traffic), no path/query parameter, no booking or customer data, no Club Med API or PSP
call, idempotent. It still exercises the real chain: header pipes, service logic, Directus round trip, JSON mapping and
response filter. `payment_content` is a close second (same shape, `caps_content`) and can be added to the same
scenario later.

Rejected for the first run: `payment_schedules`, `payment_providers`, `action_resolver` (need valid booking/proposal ids
and call the Club Med API), `payment_redirect` (POST, PSP side effects).

### D3 — Load profile, payload and thresholds

Each virtual user picks a row of `data/payment-config-headers.csv` (`locale,issuerType`, e.g. `fr-FR,GM`, `en-GB,GO`,
`de-DE,PARTNERS`, plus one row without headers for the defaults) and sends it as `accept-language` / `x-issuer-type`.

Phases (starting point, tuned after the first run and recorded here):

| Phase     | Duration | Arrival rate |
| --------- | -------- | ------------ |
| warm-up   | 30 s     | 2 → 5 rps    |
| ramp-up   | 60 s     | 5 → 50 rps   |
| sustained | 120 s    | 50 rps       |
| spike     | 30 s     | 150 rps      |

Lower than a static endpoint would allow, because each request is a Directus round trip (D4).

`ensure` thresholds (built-in `ensure` plugin, Artillery 2): `p95 < 300 ms`, `p99 < 800 ms`, `maxErrorRate < 1 %`.
The `expect` plugin checks `statusCode: 200`, `contentType: json` and the presence of `feature_flips` and `settings`, so a
`200` with a wrong body counts as an error.

### D4 — Directus is part of what we measure

Every request hits Directus, so the test loads the CMS the server points to (`DIRECTUS_URL`, `staging.cms.api.clubmed`
by default). Rules:

- Warn the team owning the staging CMS before a run, start with the low profile, stop on Directus errors (`429`/`5xx`
  show up as server `5xx`).
- Report server latency and the share spent in Directus (server logs / Datadog APM traces of the run) to tell our
  bottlenecks from the CMS ones.
- If the result says Directus is the bottleneck, the fix (`@UseCache()` on `PaymentConfigRepository.getConfigurations`,
  per the Ts.ED convention) is a separate change, and this scenario is re-run to compare.

### D5 — Environments

`config/environments.yml` uses Artillery `environments`: `local` (`http://localhost:8083`), `docker`
(`http://localhost:8080`, via `docker compose up`). Staging server only on explicit `--target` after warning the team;
production forbidden (README). Run the server with the production log level so log I/O doesn't skew the numbers.

### D6 — Reports

`artillery run --output reports/<scenario>.json` plus the console summary and `ensure` checks. `reports/` is gitignored;
noteworthy results are copied into `README.md` (baseline table with date, commit, machine, Directus target).

## Implementation notes

- **No HTML report.** Artillery 2.0.34 deprecated `artillery report` (it only points to Artillery Cloud), so the planned
  `stress:report` script was dropped. Pushing the metrics to Datadog (`publish-metrics` plugin, bundled with Artillery)
  is the candidate replacement, in a later change since it needs an API key from CI.
- **Install scripts denied.** Artillery brings `@playwright/browser-chromium` (Playwright engine), `protobufjs` and
  `unix-dgram`, whose install scripts PNPM blocks; they're set to `false` in `allowBuilds` since HTTP scenarios don't
  need them.
- **Payload not overridable.** `--overrides` can change the phases but not `config.payload` (the CSV is read before);
  testing another CSV needs a copy of the scenario.
- **Empty headers.** The last CSV row has empty columns: Artillery sends empty headers, which the server pipes treat
  as absent (`fr-FR`, `GM`).
- **Smoke results** (2026-11-24, 2 rps × 20 s, local server on a macOS dev machine, staging Directus): 40 requests,
  0 failures, median 89 ms, p95 224 ms, p99 854 ms. A single request takes 35–900 ms depending on Directus; the p99
  threshold already fails at 2 rps, which confirms Directus latency dominates (D4). Thresholds are kept until the full
  profile has run.
- **Preflight.** The first full run was launched with the server stopped: 12 255 `ECONNREFUSED` over 4 minutes.
  `scripts/run.mjs` now checks `/rest/health` then `/rest/payment_config` on the resolved target (`STRESS_ENV` or
  `--target`) before spawning `artillery run`, and exits `1` with the cause when either fails.
- **First full run, no cache** (2026-11-25, local server, staging Directus, stopped during `sustained`): fine up to
  about 30 rps (median 50–60 ms), then saturation: at 39 rps median 1.3 s and p95 3.4 s, at 50 rps 46 % failed users
  (`ERR_SOCKET_TIMEOUT` after 10 s, and `500` from Directus `SERVICE_UNAVAILABLE` "Under pressure"). Cause:
  `PaymentConfigRepository` read Directus on every request, only `AllowedOriginsRepository` was cached. Fix:
  `@UseCache({ ttl: 300, refreshThreshold: 240 })` on `getConfigurations`, `getContents` and `getProviders`.
- **Full run with `ttl: 300`** (2026-11-25, same setup): 12 255 requests, 0 failures, median 1 ms, p95 98.5 ms, p99
  1 620 ms (fail), with stalls of 1–4 s. Diagnosis: `/rest/health` stayed under 41 ms during the stalls (server-side
  durations), so neither the event loop, GC nor logging; a `fetch` trace showed 461 Directus calls in 90 s at 50 rps.
  `@tsed/platform-cache` 8.31 passes `ttl` as is to cache-manager 5.7, which reads milliseconds (the Ts.ED typings say
  seconds): entries lived 300 ms, and every expiry sent the concurrent misses to Directus at once.
- **Full run with `ttl: 5 * 60_000`, `refreshThreshold: 4 * 60_000`** (2026-11-25, same setup): 12 255 requests,
  0 failures, median 0 ms, p95 1 ms, p99 3 ms, max 177 ms (cold start: 16 parallel Directus calls in the first 300 ms,
  none after). All thresholds pass; the measured latency is now the server's, Directus is out of the hot path.
- **Checks done:** the run exits `1` on a failed threshold (p99 in the smoke run) and counts a `400` (invalid
  `x-issuer-type`) as a failed user; `STRESS_ENV=docker` switches the target to `8080`.

## Risks / Trade-offs

- Load on the shared staging Directus → low profile first, team warned, stop on errors (D4).
- Results depend on Directus latency and network from the developer machine → note the target and machine with each
  baseline; compare runs only with the same setup.
- Load generator and server on the same machine compete for CPU → numbers are indicative; prefer the Docker container
  with CPU limits or another host.
- `artillery` pulls many dependencies → isolated in its own package, dev-only.
- Thresholds are guesses until the first run → D3 values updated after it.

## Open Questions

- Target budget agreed with ops (expected peak of CAPS form loads per second)?
- Is a dedicated Directus instance (or a Directus mock) needed to load test without impacting staging users?
