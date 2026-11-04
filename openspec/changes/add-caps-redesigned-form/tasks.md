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

## 3. Cascading payment UI

- [x] 3.1 Inventory the mockups and record the cascade in `design.md` (D4, D8)
- [x] 3.2 Add the payment schedule cards (pay in full, pay in 2x, pay monthly)
- [x] 3.3 Render the payment method list as cards with the selected one expanded (`PaymentProviders` and `PaymentProviders.Panel`)
- [x] 3.4 Move `BillingAddress`, `PaymentWidget`, `Cgv` and `SubmitButton` into the panel of the selected provider in `CurrentFlow`, with a borderless `FormPanel` inside the card
- [x] 3.5 Render the BNPL panel (`Cgv` then widget) without the provider list
- [x] 3.6 Submit labels (`Pay {amount} now`, `Go to our payment partner`) and the saffron submit button
- [x] 3.7 Add stories with `play` functions and Vitest specs for the cascade (credit card, redirect, BNPL) and for `validateComponents`
- [x] 3.8 Render the `Utilities` icons named by `configuration.logos` on the provider cards
- [ ] 3.9 Check the PSP integrations (hosted fields, redirect, BNPL) inside the shadow root
- [x] 3.10 Redesign `ContactChoice` as two cards (email, SMS) from the `Send link Choice` mockups, with field labels and placeholders in the content

## 4. Stepper mode

- [x] 4.1 Add `stepper?: boolean` to `CapsFormProps` and forward it from `CapsPaymentForm` to `CapsForm`
- [x] 4.2 Leave `amount` and `provider_id` empty by default in stepper mode when the user has a choice
- [x] 4.3 Add the `Step` component and a `StepperContext`, so that `CurrentFlow` is the only flow of the `current` theme, stepper or not
- [x] 4.4 Add specs and stories for the stepper (schedule, providers, details, submit shown then hidden)
- [x] 4.5 Document the prop in `docs/embed.md`

## 5. Rollout

- [x] 5.1 Decide the default value of `theme` and the rollout order, and record it in `design.md` (D2: CMS-driven, `'legacy'` by default)
- [ ] 5.2 Add a toggle between both UIs to `packages/embed-playground`
- [ ] 5.3 Run `pnpm check`, `pnpm lint`, `pnpm fmt:check` and `pnpm test --coverage`
- [ ] 5.4 Validate both UIs end to end in the playground and in `pnpm dev:mfe`
- [x] 5.5 Server: add `theme` to `PaymentSettings`, keep only `'legacy'` or `'current'` in `PaymentConfigService`, with specs
- [x] 5.6 Regenerate the SDK types (`npx orval --project bff`)
- [x] 5.7 SDK: resolve the theme in `CapsPaymentForm` (`prop`, then CMS, then `'legacy'`), and export `useCapsTheme(config)` to resolve it from a host
- [x] 5.8 App: drop the `theme` URL parameter, resolve the theme once and pass it to `CapsPaymentForm`
- [x] 5.9 Update `docs/embed.md` and the specs and stories that relied on the `'current'` default
- [ ] 5.10 Add the `theme` key to the CMS `caps_configurations` collection (outside the repo)

## 6. Legacy removal (later change)

- [ ] 6.1 Remove `components/legacy/`, `LegacyFlow` and the `theme` prop once every host has migrated

## 7. Review follow-ups

- [x] 7.1 Query `payment_config` with a single signature (`paymentConfigQueryOptions(config)`) and share the SDK query client between the app, the theme gate and `CapsForm`
- [x] 7.2 Resolve the theme before `PaymentConfigProvider`, and serve one content per theme (`contentByTheme`)
- [x] 7.3 Merge `StepperFlow` into `CurrentFlow` (`Step` is a no-op outside the stepper)
- [x] 7.4 Add the donation to the deposit only, not to the balance, on the schedule cards

## 8. Installments choice

- [ ] 8.1 Skip the default payment condition when the provider offers a choice, in the `current` theme only (`CapsForm`, `PaymentProviders`)
- [ ] 8.2 Require `payment_condition_id` when the provider offers a choice (`validatePaymentCondition`)
- [ ] 8.3 Start `CardInstallments` empty and reset it when the provider changes
- [ ] 8.4 Cover them with specs and stories, and check the legacy specs pass unchanged

## 9. Free deposit in the provider card

- [x] 9.1 Render `FreeDepositField` at the top of the selected provider's panel for `PAYMENT_PARTIAL`, and nothing in `PaymentSchedule`
- [x] 9.2 Default `amount` to empty for a partial payment (`getDefaultSelection`) and drop the reset on mount
- [x] 9.3 Move the free deposit story to `PaymentPanel` stories
- [x] 9.4 Reveal `CardInstallments` once `amount` is valid
- [x] 9.5 Restyle the free deposit header and texts as in the mockup (legacy texts kept)
