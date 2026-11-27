## Context

- `packages/stress-tests/scripts/run.mjs` resolves the target from `STRESS_ENV` (names in `config/environments.yml`) or
  `--target`, checks `/rest/health` and `/rest/payment_config`, then runs Artillery with the `ensure` thresholds
  (p95 < 300 ms, p99 < 800 ms, failed < 1 %) and writes `reports/<scenario>.json`.
- `.gitlab-ci.yml` selects jobs with the `WORKFLOW` variable (`build`, `deploy`, `rebase`, `rebase-all`). Every job has
  a rule on its own `WORKFLOW` and `when: never` otherwise, so a new value runs only the jobs that ask for it.
- A deploy (`WORKFLOW=deploy`) pushes the image to ECR and triggers the CircleCI infra pipeline, then ends: GitLab does
  not know when the new version is live.
- Hosts: `https://staging.caps.api.clubmed`, `https://integration.caps.api.clubmed`, `https://caps.api.clubmed`.
- Runners reach the outside through `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY`.

## Goals / Non-Goals

**Goals:** run the existing scenario from CI against staging on demand, fail the job on a threshold, keep the report,
know which version was measured.

**Non-Goals:** automatic runs after deploy, other targets, new scenarios.

## Decisions

### D1. A dedicated `WORKFLOW=stress`

A pipeline with `WORKFLOW=stress` runs only the `stress-test` job, started from "Run pipeline" or a GitLab schedule
(a schedule sets `WORKFLOW=stress` as a variable). It does not depend on a deploy pipeline.

- _Rejected: a job in the deploy pipeline._ The deploy job ends before CircleCI rolls out the new version, so the job
  would have to poll `/rest/version`; and it would tie every staging deploy to a load run.
- _Rejected: a job in the build pipeline._ The build pipeline tests a branch that is not deployed.

New stage `stress`, after `test`, so the pipeline shows it on its own.

### D2. Target by `STRESS_ENV`, staging only

The job sets `STRESS_ENV: staging` (overridable when starting the pipeline). `config/environments.yml` gains
`staging: https://staging.caps.api.clubmed` and stays the single list of allowed targets: `production` or
`integration` give "Unknown STRESS_ENV" and the job fails before any request. The job does not read `ENV` (default
`integration`, meant for deploys) to avoid running against the wrong environment by default.

The README rule "never add production to `environments.yml`" stays; "staging only with `--target`" becomes "staging
through `STRESS_ENV=staging`, after warning the team".

### D3. Light install

`pnpm install --frozen-lockfile --filter @clubmed/stress-tests` instead of the whole workspace. Node image `NODE_IMG`,
`.node_configure` for the proxy settings. No heavy runner tag: Artillery at 150 rps from one container is light.

### D4. Proxy

Node's `fetch` (the preflight) ignores `HTTP(S)_PROXY` unless `NODE_USE_ENV_PROXY=1` (Node 24). Artillery 2 reads
`HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY`. The job sets `NODE_USE_ENV_PROXY=1`. If `*.clubmed` is in `NO_PROXY` and
reached directly, nothing else is needed. Spike T1 checks which way works; a load run through the proxy would also
measure the proxy, which is recorded in the baseline if it is the case.

### D5. Report and result

- Job fails when the preflight or a threshold fails (exit code of `run.mjs`).
- Artifact `packages/stress-tests/reports/payment-config.json`, `when: always`, kept 30 days.
- The preflight logs the `/rest/version` answer (`version`, `branch`), so the job log says which build was measured.
  A missing or failing `/rest/version` is logged, not fatal.

### D6. One run at a time

`resource_group: stress-staging`: two pipelines never load staging together, and the second waits instead of doubling
the load.

### D7. Load on staging

Same profile as locally (peak 150 rps for 30 s, about 12 000 requests in 4 minutes). With the 5-minute cache Directus
sees a few requests per instance; the load is on the staging server and its load balancer. The first run is announced to
the team and the CMS owners, and watched (Datadog / Kibana staging). If the staging infrastructure rate-limits (WAF,
`429`), the run reports it as failed requests: stop and agree on an allow-list before going further.

## Risks / Trade-offs

- [The runner can't reach staging] → spike T1 first; without access the change stops there.
- [Results include the proxy or the WAF] → recorded with the baseline; thresholds are not tuned on a first run.
- [A schedule loads staging during a demo] → no schedule in this change; `resource_group` prevents overlap.
- [`add-backend-stress-tests` not archived] → archive it first (tasks 3.4 and 3.5 moved to a follow-up or done).

## Implementation notes

- **Filtered install (D3).** Checked on a clean worktree: pnpm still installs the workspace root dev dependencies
  (Vitest, Storybook, Playwright...; about 1.1 GB, 47 s to 1 min 45 s with a warm store), even with
  `include-workspace-root=false`; it skips the other packages. Kept: the install stays frozen on the lockfile and the
  job is on demand. Installing Artillery alone (`npm i artillery@2.0.34` in the package) would be faster but would
  leave the lockfile.
- **Reachability (T1.2).** The CI runners (32 CPUs, 2 GB containers, `HTTP(S)_PROXY` and `NO_PROXY` set) reach
  `staging.caps.api.clubmed`: smoke run (2 rps × 20 s) then full profile (job 2702627, `1152cf6`, staging
  `1.1.0-beta.5`): 12 255 requests, all `200`, 0 failed, median 24 ms, p95 86 ms, p99 87 ms, max 187 ms, every
  threshold met. Thresholds left unchanged.
- **`STRESS_ARGS`.** Added to pass extra Artillery flags from "Run pipeline" (smoke run). Word-split by the shell, so the
  JSON of `--overrides` must have no spaces.
- **Job image.** First pipeline: the runner could not pull `-bookworm}`. `.node_configure` sets
  `image: ${NODE_IMG:-node:${NODE_VERSION}-bookworm}`, a nested default GitLab does not expand (the other jobs extend
  `.node_install_dependencies`, which sets `image: $NODE_IMG`). The job sets `image: $NODE_IMG` itself.
- **Silent Artillery exit (fixed).** Pipeline #501725 (full profile): the runner reaches staging, then Artillery exits
  `1` right after "Test run id" with no output; the smoke run of pipeline 42d8c23 (2 rps) passes. The runner has 32
  CPUs and a 2 GB container: in `distribute` mode Artillery starts `os.cpus().length - 1` workers (31), hard-coded,
  `WORKERS` is ignored. Reproduced in `node:24.17.0-bookworm` against a local mock server (no staging load) with
  `os.cpus()` faked to 32: 2 failures out of 4 at 2 GB (phases run, no metrics, exit `1`), 4 passes out of 4 at 8 GB, 4
  passes out of 4 at 2 GB with 4 workers. Fix: `patches/artillery@2.0.34.patch` reads `ARTILLERY_WORKERS` (falls back
  to the CPU count), the job sets `ARTILLERY_WORKERS: "4"`. The job keeps a diagnostics line (Node, CPUs, cgroup
  memory, proxy variable names) and a `DEBUG` variable, empty by default.
- **Pipelines (T3.3).** On the branch, the push and merge request pipelines run lint, format, build, test (and
  chromatic) but no `stress-test`; the `WORKFLOW=stress` pipelines run only `stress-test`. `chromatic` fails on the
  merge request pipelines with 3 Storybook component errors, as on `develop` (pipelines 501675, 501630): not related.
- **GitLab lint.** The local YAML parses and every other job's rules exclude `WORKFLOW=stress`; the included
  `clubmed/templates` files are only checked by GitLab itself (no `glab` here).

## Open Questions

- Do we want a GitLab schedule (weekly?) once the job works? Left to the team.
