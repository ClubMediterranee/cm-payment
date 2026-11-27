## ADDED Requirements

### Requirement: CI stress test workflow

The GitLab pipeline SHALL provide a `stress` workflow that runs only the stress test job against a deployed target,
fails when the preflight or a threshold fails, and keeps the JSON report as an artifact.

#### Scenario: Start a stress pipeline

- **WHEN** a pipeline is started with `WORKFLOW=stress`
- **THEN** only the stress test job runs, against the target named by `STRESS_ENV` (`staging` by default)
- **AND** the JSON report is attached to the job as an artifact, whether the run passes or fails

#### Scenario: Threshold exceeded in CI

- **WHEN** a threshold is exceeded during the CI run
- **THEN** the job fails

#### Scenario: Other workflows

- **WHEN** a pipeline runs with `WORKFLOW` `build`, `deploy`, `rebase` or `rebase-all`
- **THEN** the stress test job does not run

#### Scenario: No overlapping runs

- **WHEN** a stress pipeline starts while another one runs against the same target
- **THEN** the second job waits for the first to finish

### Requirement: Staging target

The stress tests SHALL allow the staging server as a named target and SHALL refuse any target not listed in the
environments file, production and integration included.

#### Scenario: Staging run

- **WHEN** the scenario runs with `STRESS_ENV=staging`
- **THEN** the requests go to `https://staging.caps.api.clubmed`

#### Scenario: Production refused

- **WHEN** the scenario runs with `STRESS_ENV=production`
- **THEN** the command exits with a non-zero code before any request

### Requirement: Measured version

The preflight SHALL print the version and branch answered by the target's `/rest/version`, and SHALL go on when that
route fails.

#### Scenario: Version printed

- **WHEN** the preflight passes on a deployed target
- **THEN** the output names the deployed version and branch before the load starts
