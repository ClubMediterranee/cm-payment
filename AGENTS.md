# Repository Guidelines

## Project Structure & Module Organization

- `packages/sdk` exposes the reusable `@clubmed/caps`; source lives in `src/`, shared styles in `public/` and
  build scripts under `scripts/`.
- `packages/app` is the full-featured demo/acceptance app; UI assets live in `src/assets`, config and environment
  samples are under `config/`.
- `packages/starter` provides a minimal integration example you can copy to new projects.
- `packages/docs` holds integration docs and diagrams used for publishable documentation.
- Common tooling (ESLint, Vitest, Tailwind, Storybook, release config) is defined at the repo root so every package
  inherits the same setup.

## Build, Test & Development Commands

- `pnpm install` — bootstrap the workspace (Node 20+, PNPM 9+ per `.nvmrc`).
- `pnpm dev:app | dev:sdk | dev:starter | dev:storybook` — run the respective package in watch/dev mode.
- `pnpm build` — type-check and bundle every package (use `--filter` to scope, e.g.,
  `pnpm --filter @clubmed/caps run build`).
- `pnpm lint` / `pnpm lint:fix` — run ESLint with the shared config; fixes formatting/lint issues.
- `pnpm test` — execute Vitest across packages, including Storybook interaction tests via `@storybook/addon-vitest`.
- `pnpm release` / `pnpm release:dry:run` — semantic-release via `@cmflow/cli`.

## Coding Style & Naming Conventions

- TypeScript-first; favor explicit types on exports and public APIs.
- React components live in PascalCase files (`PaymentForm.tsx`), hooks in camelCase (`useCheckout.ts`).
- SCSS/CSS modules follow kebab-case; Tailwind utility classes are preferred for small tweaks.
- Formatting is enforced by Prettier (2-space indent, single quotes where possible) and checked via ESLint before
  commits.

## Testing Guidelines

- Vitest + React Testing Library for unit/UI specs stored beside the component (`Component.test.tsx`).
- Storybook interaction tests live in `*.stories.tsx` files using `play` functions; run via `pnpm test` so Vitest can
  execute UI flows headlessly.
- Target meaningful coverage for SDK logic; run `pnpm test --coverage` before pushing and attach failing Storybook
  interaction diffs or screenshots to PRs if relevant.

## Commit & Pull Request Guidelines

- Conventional Commits enforced by `commitlint` (`feat`, `fix`, `docs`, `chore`, `refactor`, etc.); include scope when
  it clarifies (e.g., `feat(sdk): add token refresh`).
- Keep subject ≤ 200 chars; describe breaking changes in the body using `BREAKING CHANGE:`.
- PRs should link Club Med Jira tickets, describe the change, list test evidence (`pnpm test`, screenshots for UI), and
  highlight Storybook/Chromatic updates when UI shifts.

## Security & Configuration Tips

- Never commit secrets; use the sample env files under `packages/app/config/` as templates and inject values via CI.
- Follow the provided nginx/docker compose files for local proxying; avoid ad-hoc ports that bypass the mocked payment
  services.
- When touching release tooling, run `pnpm release:dry:run` in a safe branch to validate semantic-release setup before
  merging.
