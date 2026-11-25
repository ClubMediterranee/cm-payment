# @clubmed/stress-tests

Artillery load tests of the CAPS payment server (`@clubmed/server`). Private package, never built or published.

Design and decisions: [`openspec/changes/add-backend-stress-tests/design.md`](../../openspec/changes/add-backend-stress-tests/design.md).

## Safety rules

- **Never target production.** `config/environments.yml` only lists local targets on purpose.
- **Never target a PSP** or a route that triggers a PSP call (`payment_redirect`...).
- **Directus is loaded too.** `GET /rest/payment_config` reads Directus `caps_configurations` on every request (no cache
  today), so the run loads the CMS the server points to (`DIRECTUS_URL`, the staging CMS by default). Warn the CMS
  owners before a full run, start low, stop on `5xx`.
- The staging server is targeted only on purpose, with `--target`, after warning the team.

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
pnpm stress:payment-config --target https://my-test-host
```

Short smoke run (any Artillery flag is appended to the command):

```bash
pnpm stress:payment-config --overrides '{"config":{"phases":[{"duration":20,"arrivalRate":2}]}}'
```

Before starting Artillery, `scripts/run.mjs` checks the target: `GET /rest/health` (server up) then
`GET /rest/payment_config` (Directus reachable). If either fails, the command stops right away with the cause and exits
`1`, instead of running the whole profile against nothing.

Run the server with the production log level to keep log I/O from skewing the numbers.

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

| Date       | Commit    | Run                 | Target                                             | Requests | Median | p95    | p99    | Errors |
| ---------- | --------- | ------------------- | -------------------------------------------------- | -------- | ------ | ------ | ------ | ------ |
| 2026-11-24 | `5dbc7e7` | smoke, 2 rps × 20 s | local server (macOS dev machine), staging Directus | 40       | 89 ms  | 224 ms | 854 ms | 0      |

The full profile has not been run yet.

## Next endpoints

- `GET /rest/payment_content`: same shape (Directus `caps_content`), can be added as is.
- `GET /rest/payment_schedules/:type/:id`, `GET /rest/payment_providers/:type/:id`: need test bookings and Club Med API
  mocks.
