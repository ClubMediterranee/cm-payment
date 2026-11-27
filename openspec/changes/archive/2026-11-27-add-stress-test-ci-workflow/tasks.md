## 1. Prerequisites

- [x] 1.1 Archive `add-backend-stress-tests` (or move its tasks 3.4 and 3.5 to a follow-up) so the `backend-stress-tests` spec exists
- [x] 1.2 Spike: from a CI job, `curl` `https://staging.caps.api.clubmed/rest/health` with and without the proxy; record in `design.md` (D3, D4) which way works and the runner used

## 2. Runner

- [x] 2.1 Add `staging: https://staging.caps.api.clubmed` to `packages/stress-tests/config/environments.yml`, keep production and integration out
- [x] 2.2 `scripts/run.mjs`: log `GET /rest/version` (`version`, `branch`) in the preflight, non-fatal
- [x] 2.3 Check locally `STRESS_ENV=production` and `STRESS_ENV=integration` fail with "Unknown STRESS_ENV" before any request

## 3. GitLab CI

- [x] 3.1 Add `stress` to the `WORKFLOW` options and a `stress` stage
- [x] 3.2 Add the `stress-test` job: rule `$WORKFLOW == "stress"`, `STRESS_ENV: staging`, `NODE_USE_ENV_PROXY: "1"`, filtered `pnpm install`, `pnpm stress:payment-config`, report artifact (`when: always`, 30 days), `resource_group: stress-staging`
- [x] 3.3 Check a `WORKFLOW=build` pipeline on the branch does not show the job, and a `WORKFLOW=stress` pipeline shows only it

## 4. First run

- [x] 4.1 Warn the team and the CMS owners, then run a smoke pipeline (`--overrides` 2 rps × 20 s through a variable or a one-off edit) and check the report artifact
- [x] 4.2 Run the full profile, watch the staging server in Datadog / Kibana, record the baseline (version, results, proxy or not) in the README
- [x] 4.3 ~~Check the job fails when a threshold fails (temporary low p95) and when the preflight fails (wrong target)~~ — dropped (team decision): the exit code of `run.mjs` on a failed threshold or preflight is covered locally

## 5. Documentation

- [x] 5.1 README: "Run in CI" section (Run pipeline with `WORKFLOW=stress`, `STRESS_ENV`, artifact, `resource_group`), safety rules updated for staging
