# Repository Guidelines

## Project Structure

PNPM workspace (`packages/*`); shared tooling (oxlint, oxfmt, Vitest, Storybook, Tailwind, release) lives at the root.

- `packages/sdk` — `@clubmed/caps`, the embeddable React payment SDK (`src/`, styles in `public/`, build `scripts/`).
- `packages/mfe` — `@clubmed/caps-mfe`, Module Federation remote exposing the CAPS form, served by the server under
  `/mfe`.
- `packages/embed-playground` — `@clubmed/caps-embed-playground`, host app (React 19 + Tailwind v4) to try the embed
  wrappers.
- `packages/app` — `@clubmed/app`, demo/acceptance app; per-environment config in `config/`.
- `packages/server` — `@clubmed/server`, Ts.ED payment API consumed by the app and SDK.

## Commands

Node 24 (`.nvmrc`), PNPM 11.

- `pnpm install` — bootstrap the workspace.
- `pnpm dev:sdk | dev:app | dev:mfe | dev:embed-playground | dev:storybook` — run a package in dev mode.
- `pnpm build` — build every package; scope with `pnpm --filter <name> run build`.
- `pnpm check` — type-check (`tsc --build`).
- `pnpm lint` / `pnpm lint:fix` — oxlint.
- `pnpm fmt` / `pnpm fmt:check` — oxfmt.
- `pnpm test` — Vitest, including Storybook interaction tests; `pnpm test --coverage` before pushing.
- `pnpm generate:types` — regenerate API types (server → sdk → app).
- `pnpm release:dry:run` — validate semantic-release (`cmrelease`) on a safe branch before touching release tooling.

## Coding Style

- TypeScript-first; explicit types on exports and public APIs.
- Components in PascalCase files (`PaymentForm.tsx`), hooks in camelCase (`useCheckout.ts`), CSS modules in
  kebab-case; prefer Tailwind utilities for small tweaks.
- Formatting is owned by oxfmt (`.oxfmtrc.json`: single quotes, trailing commas, 100 cols) — don't hand-format.

## Testing

- Unit/UI specs with Vitest + React Testing Library, beside the source (`Component.test.tsx`).
- Storybook interaction tests in `*.stories.tsx` via `play` functions, run headlessly by `pnpm test`.
- Aim for meaningful coverage on SDK logic.

## Commits & Pull Requests

- Conventional Commits (commitlint); add a scope when it clarifies (`feat(sdk): add token refresh`); breaking changes
  go in the body as `BREAKING CHANGE:`.
- PRs target `develop`, link the Club Med Jira ticket, list test evidence (`pnpm test`, screenshots for UI) and flag
  Storybook/Chromatic changes.

## Security

- Never commit secrets; inject them via CI.
- Use the provided nginx/docker compose setup for local proxying; don't add ad-hoc ports that bypass the mocked
  payment services.

## Planning with OpenSpec

Plans and tasks are OpenSpec changes (`spec-driven` schema, `openspec/config.yaml`) — never ad-hoc plan or todo files.
Living specs: `openspec/specs/`. In-flight changes: `openspec/changes/<change-id>/` (kebab-case, verb-led, e.g.
`add-caps-embed`).

1. **Plan** any non-trivial task (3+ steps or an architectural decision) as a change: `proposal.md` (why/what),
   `design.md` (decisions, trade-offs), `tasks.md` (numbered checkboxes) and spec deltas in `specs/`. Use
   `/opsx:propose` or `openspec instructions <artifact>` for the templates.
2. **Validate** with `openspec validate <change-id> --strict`, then check in before implementing.
3. **Implement** (`/opsx:apply`), ticking `tasks.md` as you go; `openspec status --change <change-id>` shows progress.
4. **Re-plan** when something goes sideways: stop and update `design.md`/`tasks.md` instead of pushing on. Record
   spike findings and deviations in `design.md`.
5. **Archive** once shipped (`/opsx:archive` or `openspec archive <change-id>`) to fold the deltas into
   `openspec/specs/`.

## Working Principles

- **Simplicity & minimal impact** — touch only what's necessary; find root causes, no temporary fixes.
- **Elegance, balanced** — for non-trivial changes ask "is there a more elegant way?" and replace hacky fixes with the
  clean solution; don't over-engineer obvious fixes.
- **Verify before done** — never mark a task complete without proof: run tests, check logs, diff behavior against
  `develop` when relevant. Would a staff engineer approve it?
- **Autonomous bug fixing** — given a bug report or failing CI, investigate logs/errors/tests and fix it without
  asking for hand-holding.
- **Subagents** — offload research, exploration and parallel analysis to keep the main context clean; one task per
  subagent.
- **Communicate** — give a high-level summary of changes at each step.
- **Self-improvement** — after any user correction, add a rule to [Lessons Learned](#lessons-learned); if it only
  concerns one OpenSpec artifact, add it to `rules` in `openspec/config.yaml` instead. Review lessons at session start.

## Lessons Learned

<!-- One bullet per correction: the mistake pattern and the rule that prevents it. -->
