## Why

The Artillery stress test of `GET /rest/payment_config` (`add-backend-stress-tests`) only runs from a developer machine,
against a local server. The numbers depend on that machine and never measure the deployed stack (AWS, load balancer,
real network to Directus). We want to run the same scenario from GitLab CI against the deployed staging server, on
demand, with the report kept as a pipeline artifact.

## What Changes

- New `WORKFLOW` value `stress` in `.gitlab-ci.yml`: a pipeline started by hand ("Run pipeline") or by a GitLab schedule
  runs only the stress test job, no build, release or deploy.
- New `stress-test` job: installs only `@clubmed/stress-tests`, runs `pnpm stress:payment-config` against the target
  chosen by `STRESS_ENV` (default `staging`), fails when a threshold or the preflight fails, keeps the JSON report as an
  artifact.
- New `staging` target in `packages/stress-tests/config/environments.yml` (`https://staging.caps.api.clubmed`).
  Production and integration stay absent, so `STRESS_ENV=production` fails before any request.
- The runner prints the deployed version (`GET /rest/version`) in the preflight, so each run says which build it
  measured.
- One run at a time per target (`resource_group`).
- README: how to start the CI run, its safety rules, a baseline row for staging.

## Non-goals

- Running the stress test automatically after each deploy, or on each merge request.
- Integration or production targets.
- Creating the GitLab schedule itself (done in the GitLab UI once the job works, if wanted).
- New scenarios or new endpoints.
- Distributed load (Artillery Fargate/Lambda) or Artillery Cloud.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `backend-stress-tests`: adds the CI run on the staging server.

## Impact

- `.gitlab-ci.yml`: one `WORKFLOW` option, one job, one stage. Existing jobs already skip any `WORKFLOW` other than
  their own.
- `packages/stress-tests`: `config/environments.yml`, `scripts/run.mjs` (version in preflight, proxy), `README.md`.
- Load on the staging server and, through it, on the staging Directus (cached 5 minutes, so mostly the cold start): the
  team is warned before the first run.
- Needs the CI runner to reach `staging.caps.api.clubmed` (through the corporate proxy or directly): checked first.
- Requires `add-backend-stress-tests` to be archived first, so its `backend-stress-tests` spec exists.
