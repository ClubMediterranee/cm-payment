# @clubmed/stress-tests

Artillery load tests of the CAPS payment server (`@clubmed/server`). Private package, never built or published.

Design and decisions: [`openspec/changes/add-backend-stress-tests/design.md`](../../openspec/changes/add-backend-stress-tests/design.md).

## Safety rules

- **Never target production.** `config/environments.yml` is the list of allowed targets and never lists production
  (nor integration): `STRESS_ENV=production` stops before any request.
- **Never target a PSP** or a route that triggers a PSP call (`payment_redirect`...).
- **Directus is loaded too.** `GET /rest/payment_config` reads Directus through a 5-minute cache, so a run mostly loads
  Directus during its cold start. Warn the CMS owners before a full run, start low, stop on `5xx`.
- **Staging** (`STRESS_ENV=staging`, `https://staging.caps.api.clubmed`) is run on purpose only, after warning the team,
  and watched in Datadog / Kibana staging.

## Run

Start the server (`pnpm --filter @clubmed/server start`, port `8083`), then from the repository root:

```bash
pnpm stress:payment-config
```

Other target:

```bash
STRESS_ENV=docker pnpm stress:payment-config
```

```bash
STRESS_ENV=staging pnpm stress:payment-config
```

```bash
pnpm stress:payment-config --target https://my-test-host
```

Short smoke run (any Artillery flag is appended to the command):

```bash
pnpm stress:payment-config --overrides '{"config":{"phases":[{"duration":20,"arrivalRate":2}]}}'
```

Before starting Artillery, `scripts/run.mjs` checks the target: `GET /rest/health` (server up) then
`GET /rest/payment_config` (Directus reachable). If either fails, the command stops right away with the cause and exits
`1`, instead of running the whole profile against nothing. It then prints the deployed version (`GET /rest/version`),
so the log says which build was measured.

Run the server with the production log level to keep log I/O from skewing the numbers.

## Run in CI

In GitLab, **Build > Pipelines > Run pipeline** on the branch to use (usually `develop`), with the variable
`WORKFLOW=stress`. The pipeline runs only the `stress-test` job (stage `stress`); a GitLab schedule with the same
variable works too.

| Variable      | Default   | Use                                                                                                                       |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `STRESS_ENV`  | `staging` | Target, one of `config/environments.yml`                                                                                  |
| `STRESS_ARGS` | empty     | Extra Artillery flags, e.g. `--overrides {"config":{"phases":[{"duration":20,"arrivalRate":2}]}}` (no spaces in the JSON) |

- The job fails when the preflight or a threshold fails.
- The report `reports/payment-config.json` is a job artifact (kept 30 days), even when the job fails.
- One run at a time per target (`resource_group: stress-<STRESS_ENV>`): a second pipeline waits for the first.
- The runner reaches the target through the CI proxy (`HTTP(S)_PROXY`, `NO_PROXY`; `NODE_USE_ENV_PROXY=1` for the
  preflight).

## Results

The console prints a summary every 10 s and at the end, followed by the `ensure` checks: the command exits `1` when a
threshold fails (p95 < 300 ms, p99 < 800 ms, failed users < 1 %). The full metrics are written to
`reports/payment-config.json` (gitignored). Artillery 2 dropped the `artillery report` HTML command.

## Files

| Path                              | Content                                                         |
| --------------------------------- | --------------------------------------------------------------- |
| `config/environments.yml`         | Shared targets: `local` (8083, default), `docker` (8080)        |
| `data/payment-config-headers.csv` | `accept-language` × `x-issuer-type` combinations, one empty row |
| `scenarios/payment-config.yml`    | Phases, checks (`expect`) and thresholds (`ensure`)             |

## Baseline

| Date       | Commit                              | Run                                         | Target                                             | Requests | Median          | p95    | p99      | Errors                  |
| ---------- | ----------------------------------- | ------------------------------------------- | -------------------------------------------------- | -------- | --------------- | ------ | -------- | ----------------------- |
| 2026-11-24 | `5dbc7e7`                           | smoke, 2 rps × 20 s                         | local server (macOS dev machine), staging Directus | 40       | 89 ms           | 224 ms | 854 ms   | 0                       |
| 2026-11-25 | `5186e83`                           | full, no cache, stopped during `sustained`  | local server (macOS dev machine), staging Directus | ~1 900   | 1.6 s at 50 rps | 3.5 s  | 7.3 s    | 46 % of users at 50 rps |
| 2026-11-25 | `5186e83` + `@UseCache` (ttl 300)   | full                                        | local server (macOS dev machine), staging Directus | 12 255   | 1 ms            | 98 ms  | 1 620 ms | 0                       |
| 2026-11-25 | `5186e83` + `@UseCache` (ttl 5 min) | full                                        | local server (macOS dev machine), staging Directus | 12 255   | 0 ms            | 1 ms   | 3 ms     | 0                       |
| 2026-11-27 | `2c89c96` + Ts.ED 8.50.0            | full                                        | local server (macOS dev machine), staging Directus | 12 255   | 1 ms            | 2 ms   | 3 ms     | 0                       |
| 2026-11-27 | `2c89c96` + Ts.ED 8.50.0            | full, built server (`node dist`, port 8090) | local server (macOS dev machine), staging Directus | 12 255   | 0 ms            | 1 ms   | 2 ms     | 0                       |

Without cache, Directus throttles from about 30 rps (`SERVICE_UNAVAILABLE`, "Under pressure", returned as `500`) and
requests time out at 50 rps. `@tsed/platform-cache` passes `ttl` to cache-manager 5 in milliseconds, so `ttl: 300`
cached for 300 ms: Directus was still called about 4 times per second, with stalls of 1–4 s when it slowed down. With
`ttl: 5 * 60_000` every threshold passes (max 177 ms, during the cold start). See `design.md` (Implementation notes).

## Next endpoints

- `GET /rest/payment_content`: same shape (Directus `caps_content`), can be added as is.
- `GET /rest/payment_schedules/:type/:id`, `GET /rest/payment_providers/:type/:id`: need test bookings and Club Med API
  mocks.
