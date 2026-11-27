# backend-stress-tests Specification

## Purpose

Repeatable Artillery load tests of the CAPS payment server business endpoints (`packages/stress-tests`), with
performance thresholds, JSON reports and a fixed list of allowed targets (never production nor a PSP).

## Requirements

### Requirement: Stress test package

The repository SHALL provide a private `@clubmed/stress-tests` workspace package running Artillery scenarios against
the payment server, isolated from the server dependencies and never published.

#### Scenario: Run the payment config scenario locally

- **WHEN** the server runs locally and a developer runs `pnpm stress:payment-config`
- **THEN** Artillery runs the `payment-config` scenario against `http://localhost:8083/rest/payment_config`
- **AND** writes a JSON report into `packages/stress-tests/reports/`

#### Scenario: Run against another target

- **WHEN** a developer runs the scenario with the `docker` environment or an explicit `--target`
- **THEN** the requests go to that target instead of the local server

### Requirement: Preflight check

The run SHALL check that the target server and its Directus dependency answer before starting the load, and SHALL stop
with a non-zero exit code and the cause otherwise.

#### Scenario: Server not started

- **WHEN** a developer runs the scenario while nothing listens on the target
- **THEN** the command exits with a non-zero code before any load phase, telling to start the server

#### Scenario: Directus unavailable

- **WHEN** the server answers `/rest/health` but `/rest/payment_config` fails
- **THEN** the command exits with a non-zero code before any load phase, telling to check the Directus settings

### Requirement: Payment config load profile

The `payment-config` scenario SHALL load `GET /rest/payment_config` through warm-up, ramp-up, sustained and spike
phases, varying the `accept-language` and `x-issuer-type` headers from a data file, and SHALL check each response.

#### Scenario: Header combinations

- **WHEN** the scenario runs
- **THEN** requests are spread over the locale and issuer type combinations of the data file, including requests
  without these headers

#### Scenario: Valid response

- **WHEN** a response is a `200` JSON body with `feature_flips` and `settings`
- **THEN** Artillery counts it as a successful request

#### Scenario: Unexpected response

- **WHEN** a response has a status other than `200` or lacks `feature_flips` or `settings`
- **THEN** Artillery counts it as a failed request

### Requirement: Performance thresholds

The scenario SHALL define thresholds on p95 latency, p99 latency and error rate, and the run SHALL exit with a non-zero
code when one of them is exceeded.

#### Scenario: Threshold exceeded

- **WHEN** the p95 latency is above the configured threshold at the end of the run
- **THEN** the command exits with a non-zero code and reports the failed threshold

#### Scenario: Thresholds met

- **WHEN** every threshold is met
- **THEN** the command exits with code `0`

### Requirement: Safe targets

The stress tests SHALL NOT target production or third-party PSPs, and the documentation SHALL state it, along with the
load put on the Directus instance used by the server.

#### Scenario: Default target

- **WHEN** no environment or target is given
- **THEN** the scenario targets the local server
