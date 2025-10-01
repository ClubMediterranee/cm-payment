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

This repository is a PNPM monorepo that groups together the building blocks around the Club Med payment SDK and its integration examples.

- packages/sdk — Reusable payment SDK library (@clubmed/payment-sdk)
- packages/app — Demo/acceptance application
- packages/starter — Minimal integration starter

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

PNPM tip: you can target a specific package with --filter. Example:

```sh
pnpm --filter @clubmed/payment-sdk run build
pnpm --filter @clubmed/app run dev
```

## Repository structure

- packages/\*: package code (sdk, app, starter)
- storybook: managed with Storybook 9 + React/Vite (see vite.storybook.config.ts)
- tools/CI: GitLab CI, Chromatic, ESLint/Prettier, Vitest configuration
- release.config.mjs: semantic-release configuration via @cmflow/cli

## Quality, Lint & Tests

- Lint: ESLint + stylistic and React/JSX configurations
- Format: Prettier (lint-staged preconfigured)
- Tests: Vitest (unit), @testing-library for React, Playwright (preinstalled in pretest)

Examples:

```sh
pnpm test
pnpm --filter @clubmed/payment-sdk run test
```

## Storybook & Design System

- Local dev: pnpm dev:storybook (port 6006 by default)
- Visual publishing: Chromatic (see chromatic.config.json and CI pipeline)

## Configuration & Environments

Some packages include .env.\* files (e.g., packages/app/config/.env.staging). Refer to each package for the required variables (APIs, keys, URLs).

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

## License

© Club Med. Internal use and/or in accordance with company policies.
