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

This repository is a PNPM monorepo that groups together the building blocks around the Club Med payment SDK (`@clubmed/caps`, published as `@clubmed/payment-sdk`) and its integration examples.

- packages/sdk — Payment SDK library (`@clubmed/caps`)
- packages/app — Demo/acceptance application
- packages/starter — Minimal integration starter
- packages/server — Ts.ED + Fastify integration server that exposes helper REST endpoints, serves the built front-ends, and proxies to Club Med APIs
- packages/docs — Docusaurus site with integration guides and API docs
- packages/esbuild-pkg-plugin — Internal build helper consumed by the SDK bundler

## Prerequisites

- Node.js 20+
- PNPM 9+
- A modern browser (for Storybook development and e2e tests)

Tip: use the Node version indicated by .nvmrc.

## Installation

1. Install workspace dependencies:

   ```sh
   pnpm install
   ```

2. (Optional) Generate types from schemas/OpenAPI if needed:
   ```sh
   pnpm generate:types
   ```

## Quick start

- Run the demo application:

  ```sh
  pnpm dev:app
  ```

- Run the SDK in dev mode (watch build depending on the package config):

  ```sh
  pnpm dev:sdk
  ```

- Run the starter:

  ```sh
  pnpm dev:starter
  ```

- Storybook (SDK UI, components):

  ```sh
  pnpm dev:storybook
  ```

- Start the Ts.ED integration server (serves the built app/starter/docs/storybook bundles and proxies `/api`):

  ```sh
  pnpm --filter @clubmed/server run start
  ```

  Build the front-ends you need before starting the server (`pnpm build:app`, `pnpm --filter @clubmed/starter run build`, `pnpm --filter docs run build`, `pnpm build-storybook`). For a production-like run use `pnpm build:server` followed by `pnpm --filter @clubmed/server run start:prod`.

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

- Release (driven by cmflow/semantic-release):

  ```sh
  pnpm release:dry:run
  pnpm release
  ```

- Ts.ED server (build/test/prod):

  ```sh
  pnpm build:server
  pnpm --filter @clubmed/server run test
  pnpm --filter @clubmed/server run start:prod
  ```

PNPM tip: you can target a specific package with --filter. Example:

```sh
pnpm --filter @clubmed/caps run build
pnpm --filter @clubmed/app run dev
```

## Repository structure

- `packages/sdk`: payment SDK source published as `@clubmed/caps`
- `packages/app`: full-featured acceptance app (Vite on port 4003)
- `packages/starter`: minimal integration example (Vite on port 4004)
- `packages/server`: Ts.ED + Fastify server that proxies APIs and serves the built front-ends
- `packages/docs`: Docusaurus documentation site compiled to `packages/docs/build`
- `packages/esbuild-pkg-plugin`: internal esbuild helpers used by the SDK build pipeline
- `doc/`: architectural notes and diagrams
- `storybook-static/`: generated via `pnpm build-storybook`
- `tools/` and shared root configs: GitLab CI, Chromatic, ESLint/Prettier, Vitest
- `release.config.mjs`: semantic-release configuration via `@cmflow/cli`

## Ts.ED integration server (`packages/server`)

- Fastify-based Ts.ED 8 runtime listening on port `8083`
- Serves pre-built assets from the workspace: `/` → `packages/app/dist`, `/starter` → `packages/starter/dist`, `/docs` → `packages/docs/build`, `/storybook` → `storybook-static`
- Proxies `/api/*` to `CLUBMED_API_URL` while forwarding `x-request-id` headers
- Automatically exposes REST hooks under `/rest/*` and Swagger UI at `/oas`

### Run it locally

1. Build the bundles you want to embed: `pnpm build:app`, `pnpm --filter @clubmed/starter run build`, `pnpm --filter docs run build`, `pnpm build-storybook`.
2. Start the watcher-powered dev server (nodemon + SWC):
   ```sh
   pnpm --filter @clubmed/server run start
   ```
3. For a production-like snapshot, run `pnpm build:server` followed by `pnpm --filter @clubmed/server run start:prod`.
4. Tests and lint live inside the package: `pnpm --filter @clubmed/server run test` (or `test:watch` / `test:coverage`).

### Key endpoints

- `/rest/health` – lightweight health probe
- `/rest/version` – exposes the package version and `resources/release.info` branch info when present
- `/rest/payment_redirect` – placeholder that performs a 302 redirect
- `/oas` – Swagger UI backed by the Ts.ED OpenAPI spec
- `/api/*` – proxied to `CLUBMED_API_URL`

### Configuration

`packages/server` relies on DotEnv files located next to the package (`.env`, `.env.local`, `.env.staging`, etc.). Relevant environment variables include:

- `HOST` – override the advertised host returned by `configuration().getBestHost()`
- `CLUBMED_API_URL` – upstream REST API used by the `/api` proxy and the `ApiClient`
- `API_KEY` – API key injected into outbound requests sent via `ApiClient`
- `AKAMAI_CALLER_HEADER` – custom caller header name (defaults to `X-CLUBMED-CALLER`)
- `TRUST_PROXY` – set to `true` when the server is deployed behind a reverse proxy
- `logger.disableRoutesSummary` – set to `true` to silence Ts.ED's boot summary logs

## Quality, Lint & Tests

- Lint: ESLint + stylistic and React/JSX configurations
- Format: Prettier (lint-staged preconfigured)
- Tests: Vitest (unit), @testing-library for React, Playwright (preinstalled in pretest)

Examples:

```sh
pnpm test
pnpm --filter @clubmed/caps run test
```

## Storybook & Design System

- Local dev: pnpm dev:storybook (port 6006 by default)
- Visual publishing: Chromatic (see chromatic.config.json and CI pipeline)

## Configuration & Environments

- `packages/app` and `packages/starter` ship sample `.env.*` files under their `config/` folders. Copy the appropriate template (staging/production/local) and provide the API hosts, OIDC data, and `VITE_` prefixed values those Vite apps expect.
- `packages/server` reads `.env`, `.env.local`, `.env.staging`, etc., via Ts.ED's `DotEnvsConfigSource`. Set the variables described in the Ts.ED section (`CLUBMED_API_URL`, `API_KEY`, `AKAMAI_CALLER_HEADER`, `HOST`, `TRUST_PROXY`, etc.) before booting the server.
- CI/CD injects secrets at runtime; do not commit credentialed `.env` files.

## Publishing & Release

Publishing relies on semantic-release via @cmflow/cli (cmrelease):

- Managed branches: main, develop, next-release, and maintenance branches (x.x)
- Release notes and Jira tickets: semantic-release-jira-\*
- Versioning: based on conventional commits

Commands:

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

## CI/CD

- GitLab CI: see .gitlab-ci.yml and .gitlab/ci/\*.yml
- Chromatic: visual publishing and reviews
- Backmerge/Repo sync: handled by @cmflow/cli tasks (see release.config.mjs)

## Troubleshooting

- TS build issues: run tsc -b or pnpm build at the root to ensure project references are up to date.
- Node/PNPM versions: make sure you use Node 20+ and PNPM 9+.
- Caches: pnpm store prune and delete node_modules if needed.
- Ts.ED server issues: if `/` or `/starter` return 404s, rebuild the corresponding front-end (`pnpm build:app`, `pnpm --filter @clubmed/starter run build`, `pnpm --filter docs run build`, `pnpm build-storybook`). Proxy failures usually mean `CLUBMED_API_URL` or `API_KEY` is missing from `packages/server/.env`.

## License

© Club Med. Internal use and/or in accordance with company policies.
