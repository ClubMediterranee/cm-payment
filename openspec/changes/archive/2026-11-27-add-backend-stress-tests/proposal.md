## Why

The payment backend (`@clubmed/server`, Ts.ED + Fastify) has never been load tested: we don't know its throughput,
latency percentiles or breaking point on business routes before it faces production traffic. We want a repeatable
stress test setup based on Artillery, starting with one simple business endpoint to validate the tooling and get a
first baseline before covering the payment flow.

## What Changes

- Add a `packages/stress-tests` workspace package (`@clubmed/stress-tests`, private) with Artillery as a dev dependency.
- Add a first scenario targeting `GET /rest/payment_config`, the call every CAPS form makes on load: no path or query
  parameter, no booking, no PSP, a single upstream (Directus `caps_configurations`) and the business resolution of
  overrides by locale and issuer type.
- Vary the `accept-language` (e.g. `fr-FR`, `en-GB`, `de-DE`) and `x-issuer-type` (`GM`, `GO`, `PARTNERS`) headers from a
  CSV payload so the override resolution is exercised, not a single cached path.
- Load profile in phases (warm-up, ramp-up, sustained, spike) with `ensure` thresholds (p95, p99, error rate) that make
  the run exit non-zero when exceeded; each response checked (`200`, `feature_flips` and `settings` present).
- Target set by environment (`local` by default on `http://localhost:8083`, `docker` on `http://localhost:8080`),
  overridable with `--target`.
- Root script `pnpm stress:payment-config`, writing a JSON report.
- A `README.md` explaining how to run it and the rules (never against production, never against PSPs, Directus load).

## Non-goals

- Endpoints that need a booking or call the Club Med API / PSPs (`payment_schedules`, `payment_providers`,
  `payment_redirect`, `action_resolver`): follow-up changes, with mocks.
- Changing the server code (e.g. adding a cache on Directus reads): if the run shows it's needed, it's a separate change
  driven by these results.
- Running the stress test in CI on each pipeline (manual / on-demand only for now).
- Distributed load (Artillery Fargate/Lambda) or Artillery Cloud dashboards.

## Capabilities

### New Capabilities

- `backend-stress-tests`: repeatable Artillery load tests of the payment server business endpoints, with thresholds and
  reports.

### Modified Capabilities

None.

## Impact

- New package `packages/stress-tests`, picked up by `pnpm-workspace.yaml` (`packages/*`).
- `pnpm-lock.yaml` gains `artillery`.
- Root `package.json`: one script. `pnpm-workspace.yaml`: Artillery's install scripts are denied in `allowBuilds`. No
  change to the server code.
- Load on the Directus instance the server points to (`DIRECTUS_URL`, staging CMS by default): see design D4.
