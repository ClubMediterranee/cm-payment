<div style="text-align: center" align="center">
 <img src="https://ns.clubmed.com/fbs/RWD/branding2023/Logo/MicrosoftTeams-image%20(9).png" width="200" alt="Club Med"/>
</div>

<div align="center">
   <h1>ClubMed Payment SDK Workspace</h1>
   <hr />

[![npm version](https://badge.fury.io/js/%40clubmed%2Fpayment-sdk.svg)](https://badge.fury.io/js/%40clubmed%2Fpayment-sdk)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

</div>

# Club Med Payment Workspace

This repository is a PNPM monorepo that groups together the building blocks around the Club Med payment SDK (`@clubmed/caps`).

- `packages/sdk` — Payment SDK library (`@clubmed/caps`), the React payment form components at the heart of the workspace
- `packages/app` — Demo/acceptance application (Vite, port 4003)
- `packages/server` — Ts.ED + Fastify integration server that exposes helper REST endpoints, serves the built front-end, and proxies to Club Med APIs

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- PNPM 9+
- A modern browser (for Storybook development and e2e tests)

Tip: use the Node version indicated by `.nvmrc`.

## Installation

1. Install workspace dependencies:

   ```sh
   pnpm install
   ```

2. (Optional) Generate types from schemas/OpenAPI if needed:

   ```sh
   pnpm generate:types
   ```

   This regenerates the types for the SDK, the app, and the server. To target a single package:

   ```sh
   pnpm --filter @clubmed/caps run generate:types
   pnpm --filter @clubmed/app run generate:types
   pnpm --filter @clubmed/server run generate:types
   ```

## Quick start

- Run the demo application:

  ```sh
  pnpm dev:app
  ```

- Run the SDK in dev mode (watch build):

  ```sh
  pnpm dev:sdk
  ```

- Storybook (SDK UI, components):

  ```sh
  pnpm dev:storybook
  ```

- Start the Ts.ED integration server (serves the built front-end and proxies `/api`):

  ```sh
  pnpm --filter @clubmed/server run start
  ```

  Build the front-end you need before starting the server (`pnpm build:app`, `pnpm build-storybook`).

## Main scripts (root)

- Lint:

  ```sh
  pnpm lint
  pnpm lint:fix
  ```

- Tests (unit, coverage):

  ```sh
  pnpm test
  ```

- Build (all packages):

  ```sh
  pnpm build
  ```

- Storybook (static build):

  ```sh
  pnpm build-storybook
  ```

- Chromatic (publish stories):

  ```sh
  pnpm chromatic
  ```

- Generate types (SDK + app + server):

  ```sh
  pnpm generate:types
  ```

- Release (driven by cmflow/semantic-release):

  ```sh
  pnpm release:dry:run
  pnpm release
  ```

PNPM tip: you can target a specific package with `--filter`. Example:

```sh
pnpm --filter @clubmed/caps run build
pnpm --filter @clubmed/app run dev
```

## Repository structure

- `packages/sdk`: payment SDK source published as `@clubmed/caps`
- `packages/app`: full-featured acceptance app (Vite on port 4003)
- `packages/server`: Ts.ED + Fastify server that proxies APIs and serves the built front-end
- `doc/`: architectural notes and diagrams
- `storybook-static/`: generated via `pnpm build-storybook`
- `release.config.mjs`: semantic-release configuration via `@cmflow/cli`

## Ts.ED integration server (`packages/server`)

- Fastify-based Ts.ED runtime listening on port `8083`
- Serves pre-built assets from the workspace: `/` → `packages/app/dist`, `/storybook` → `storybook-static`
- Proxies `/api/*` to `CLUBMED_API_URL` while forwarding `x-request-id` headers
- Exposes REST hooks under `/rest/*` and Swagger UI at `/oas`

### Configuration

`packages/server` reads DotEnv files located next to the package (`.env`, `.env.local`, `.env.staging`, etc.). Relevant environment variables include:

- `CLUBMED_API_URL` – upstream REST API used by the `/api` proxy and the `ApiClient`
- `CLUBMED_API_KEY` – API key injected into outbound requests sent via `ApiClient`
- `AKAMAI_CALLER_HEADER` – custom caller header name (defaults to `X-CLUBMED-CALLER`)
- `TRUST_PROXY` – set to `true` when the server is deployed behind a reverse proxy

Do not commit credentialed `.env` files.

## Quality, Lint & Tests

- Lint: ESLint + stylistic and React/JSX configurations
- Format: Prettier (lint-staged preconfigured)
- Tests: Vitest (unit), @testing-library for React, Playwright (installed in `pretest`)

```sh
pnpm test
pnpm --filter @clubmed/caps run test
```

## Publishing & Release

Publishing relies on semantic-release via `@cmflow/cli` (cmrelease):

- Managed branches: `main`, `develop`, and maintenance branches (`x.x`)
- Versioning: based on conventional commits (feat / fix / docs / chore / refactor …)

```sh
pnpm release:dry:run
pnpm release
```

Commit conventions (examples):

- feat: add a feature
- fix: bug fix
- docs: documentation
- chore: chores and maintenance
- refactor: refactor with no behavioral change

These conventions automatically trigger the appropriate version type (major/minor/patch).

## Branch naming

Branches use dashes (`-`) as separators, following the pattern:

```
<type>-<ticket>-<short-description>
```

- `<type>` — matches the commit conventions: `feature`, `fix`, `chore`, `refactor`, `docs`
- `<ticket>` — the Jira ticket key in lower case (e.g. `gpay-329`)
- `<short-description>` — a few kebab-case words summarizing the change

Examples:

- `feature-gpay-329-cart-route`
- `fix-gpay-341-coverage-threshold`
- `refactor-gpay-308-deferred-payment`

## CI/CD

- GitLab CI: see .gitlab-ci.yml and .gitlab/ci/\*.yml
- Chromatic: visual publishing and reviews
- Backmerge/Repo sync: handled by @cmflow/cli tasks (see release.config.mjs)

## Troubleshooting

- TS build issues: run tsc -b or pnpm build at the root to ensure project references are up to date.
- Node/PNPM versions: make sure you use Node 20+ and PNPM 9+.
- Caches: pnpm store prune and delete node_modules if needed.
- Ts.ED server issues: if `/` or `/storybook` return 404s, rebuild the corresponding front-end (`pnpm build:app`, `pnpm build-storybook`). Proxy failures usually mean `CLUBMED_API_URL` or `CLUBMED_API_KEY` is missing from `packages/server/.env`.

## License

© Club Med. Internal use and/or in accordance with company policies.
