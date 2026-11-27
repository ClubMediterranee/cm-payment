## ADDED Requirements

### Requirement: REST responses are never cacheable

The server SHALL send `Cache-Control: private, no-store` on every `/rest` response whose handler did not set a
`Cache-Control` header.

#### Scenario: REST success

- **WHEN** a client calls `GET /rest/payment_config`
- **THEN** the response has `Cache-Control: private, no-store`

#### Scenario: REST error

- **WHEN** a `/rest` request fails with a 4xx or 5xx error
- **THEN** the response has `Cache-Control: private, no-store`

#### Scenario: Handler sets its own header

- **WHEN** a `/rest` handler sets `Cache-Control` itself
- **THEN** the server keeps that value

### Requirement: Bounded upstream calls

The server SHALL abort an upstream call (Club Med API client or `/api` proxy) that exceeds a configurable timeout, 8
seconds by default, and SHALL bound the total waiting time of the payment status polling and of the DTMF redirect
retry, 20 seconds by default, whatever attempts and delays Directus sets.

#### Scenario: Slow upstream

- **WHEN** the Club Med API does not answer within the timeout
- **THEN** the call fails with the server's gateway error instead of waiting

#### Scenario: Polling settings too high

- **WHEN** Directus sets status polling attempts and delay whose product exceeds the budget
- **THEN** the server stops polling once the budget is reached, returns the last status and logs
  `PAYMENT_POLL_BUDGET_REACHED`

### Requirement: No SPA fallback for API and asset paths

The server SHALL answer a JSON `404` for unknown `GET /rest/*` paths and missing `/assets/*` files, and SHALL keep
serving `index.html` for other unknown paths of the app.

#### Scenario: Unknown REST path

- **WHEN** a client calls `GET /rest/unknown`
- **THEN** the response is a JSON `404`, not `index.html`

#### Scenario: Missing asset

- **WHEN** a client requests a file under `/assets/` that does not exist
- **THEN** the response is a `404`

#### Scenario: App page

- **WHEN** a client requests an app route such as `/payment`
- **THEN** the response is `index.html`

### Requirement: Container runtime

The Docker image SHALL run Node as its main process, so `SIGTERM` reaches the server and triggers its graceful stop,
and SHALL NOT contain `packages/server/.env`.

#### Scenario: Graceful stop

- **WHEN** the container receives `SIGTERM`
- **THEN** the Node process receives it and the server runs its graceful stop

#### Scenario: No local env file

- **WHEN** the image is built
- **THEN** it contains no `packages/server/.env` file

### Requirement: Environment level

Deployed environments SHALL run with `NODE_ENV=production`, and the server SHALL read the environment level from
`APP_ENV_LEVEL` (`local` when unset) and return it as `env_level` from `GET /rest/version`.

#### Scenario: Staging

- **WHEN** the server runs on staging with `APP_ENV_LEVEL=staging`
- **THEN** `GET /rest/version` returns `env_level: "staging"` and the server uses its production settings

#### Scenario: Local development

- **WHEN** `APP_ENV_LEVEL` is not set
- **THEN** `GET /rest/version` returns `env_level: "local"`
