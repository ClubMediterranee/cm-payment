## 1. Shared headless hooks (dropped)

- [x] ~~1.1 Extract the schedule options logic of `PaymentSchedule` into a headless hook, consumed by the current component~~ — reverted, the logic stays in the components
- [x] ~~1.2 Extract the provider options and reset rules of `PaymentProviders` into a headless hook, consumed by the current component~~ — reverted
- [x] 1.3 Check that the existing specs and stories pass unchanged (`pnpm test`)

## 2. Legacy isolation and switch

- [x] 2.1 Duplicate the current form components (without specs and stories) into `packages/sdk/src/components/legacy/`
- [x] 2.2 Export the legacy components under explicit names from `src/index.ts`
- [x] 2.3 Extract the current `Flow` of `packages/mfe/src/RemoteCapsForm.tsx` as `LegacyFlow`
- [x] 2.4 Add `theme?: 'legacy' | 'current'` to `CapsFormProps` (`src/embed/shared/types.ts`) and forward it to the remote
- [x] 2.5 Render `LegacyFlow` when `theme` is `'legacy'` in `RemoteCapsForm`, and cover it with a spec
- [ ] 2.6 Point `packages/app` to the legacy components
- [ ] 2.7 Adapt `validateComponents` and the form skeleton so both component sets are accepted

## 3. New step-by-step UI

- [ ] 3.1 Add the step navigation state and the per-step `trigger` validation
- [ ] 3.2 Add the payment schedule step (cards: pay in full, pay in 2x, pay monthly)
- [ ] 3.3 Add the payment method step, with the PSP widget
- [ ] 3.4 Add the remaining steps (contact, billing address, CGV, comments, donation) and the submit
- [ ] 3.5 Add stories with `play` functions and Vitest specs for each step and for the full flow
- [ ] 3.6 Check the PSP integrations (hosted fields, redirect, BNPL) inside the shadow root

## 4. Rollout

- [ ] 4.1 Decide the default value of `theme` and the rollout order, and record it in `design.md`
- [ ] 4.2 Add a toggle between both UIs to `packages/embed-playground`
- [ ] 4.3 Run `pnpm check`, `pnpm lint`, `pnpm fmt:check` and `pnpm test --coverage`
- [ ] 4.4 Validate both UIs end to end in the playground and in `pnpm dev:mfe`

## 5. Legacy removal (later change)

- [ ] 5.1 Remove `components/legacy/`, `LegacyFlow` and the `theme` prop once every host has migrated
