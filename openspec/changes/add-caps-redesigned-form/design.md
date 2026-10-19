## Context

- `packages/mfe/src/RemoteCapsForm.tsx` hard-codes the current UI as a sequence of SDK components inside `Flow`: `Form`, `PaymentSchedule`, `PaymentProviders`, `CardInstallments`, `ContactChoice`, `Donation`, `Comments`, `Cgv`, `BillingAddress`, `PaymentWidget`, `SubmitButton`.
- The form logic is already separate from the UI: `useCapsForm` (react-hook-form and the zod `capsFormSchema`), the `hooks/data/*` BFF hooks and `usePaymentSubmit`. `PaymentSchedule` and `PaymentProviders` still mix `Controller` and markup.
- `providers/CapsForm.tsx` runs `validateComponents`, which checks that each issuer's required components (`GLOBAL_CAPS_SETTINGS.components[issuer]`) are present among the children, through the `COMPONENT_KEY` symbols.
- The PSP registry (`definePspProvider`) has no variant dimension.
- The host-to-remote contract is `CapsFormProps` (`src/embed/shared/types.ts`) with `CAPS_PROTOCOL_VERSION`. The SDK and the MFE have no variant or feature-flag mechanism today.

## Goals / Non-Goals

**Goals:**

- Ship the redesigned step-by-step UI next to the current one, selectable per embed.
- Keep one form, one schema, one submit path and one set of BFF and Directus calls.
- Make removing the legacy UI a deletion of a folder, one flow and one prop.

**Non-Goals:**

- No change to the BFF, Directus content or generated API types.
- No new PSP behaviour. No change to the embed protocol major version.
- No migration of `packages/app` to the new UI in this change.

## Decisions

### D1. Legacy in a sub-folder, latest at the root

The current components are moved with `git mv` to `components/legacy/`. The new components take the root of `components/` with the same names. `src/index.ts` exports the new ones under their usual names and the legacy ones under explicit names (for example `LegacyPaymentSchedule`).

Alternatives rejected:

- An `if (theme === 'legacy')` branch inside each component couples both UIs and makes the removal painful.
- A second Module Federation remote duplicates the bundle, the protocol and the config for a presentation difference.

### D2. The switch is driven by the CMS, with a prop override

`CapsFormProps.theme?: 'legacy' | 'current'` is forwarded to `RemoteCapsForm`, which renders `LegacyFlow` (the current `Flow`, extracted unchanged) or the new `Flow`. The prop is optional, so no protocol major bump. The providers (`ShadowHost`, `PaymentConfigProvider`, `Form`) are shared.

When the prop is absent, the theme comes from the CMS: a `theme` key (type `string`, value `'legacy'` or `'current'`) in the Directus `caps_configurations` collection, with the usual overrides by locale and issuer. `GET /rest/payment_config` exposes it as `settings.theme`, and falls back to `'legacy'` when the key is missing or holds another value. Resolution order: `theme` prop, then the CMS, then `'legacy'`.

The theme is no longer read from the URL in `packages/app`. The app resolves it from the same endpoint (`useCapsTheme`, exported by the SDK) and passes it to `CapsPaymentForm` as the `theme` prop, so that its own header and layout follow the same value and the form does not wait for the configuration to choose its flow.

`paymentConfigQueryOptions(config)` always takes the host config, and its key is scoped by API url, locale and issuer. `useCapsTheme` queries through the SDK query client (`sdkQueryClient`) instead of the nearest provider, so the app, the theme gate and `CapsForm` share one cache entry and one `GET /rest/payment_config`.

`CapsPaymentForm` resolves the theme before mounting `PaymentConfigProvider`, which receives it as a `theme` prop.

Alternatives rejected:

- A `theme` URL query parameter: cannot be controlled per locale and issuer, and any visitor can change it.
- A per-page setting: `caps_configurations` only overrides by locale and issuer. A finer dimension is out of scope here.

### D3. Duplication first, no shared hooks

The current components are duplicated into `components/legacy/` as they are. The logic stays inside the components: no headless hooks are extracted, so the refactor of the root components can change both logic and rendering freely.

### D4. Cascade instead of step navigation (re-planned from the Figma mockups)

The mockups (`[513] Epic Paiement`, frames `D 511 *`, `D 512 *`) do not show a stepper. The form is one page that unfolds in cascade: the schedule cards, then the list of payment methods, and the selected method expands in place with everything needed to pay. The previous decision (a local step index with per-step `trigger`) is dropped. The form fields (`amount`, `provider_id`, `payment_condition_id`, ...), `capsFormSchema` and the submit path (`usePaymentSubmit`) are unchanged.

Inventory of the cascade, from the mockups:

- Schedule cards (`PaymentSchedule`): pay in full, pay in 2x, pay monthly (BNPL). A single schedule is still shown as one card.
- Payment method list (`PaymentProviders`): one card per provider (radio, label, description, logos). Only the selected one is expanded.
- Expanded panel of the selected provider, in this order:
  - Credit card (hosted fields): `BillingAddress`, `PaymentWidget` (cardholder, number, expiry, CVV), `Cgv`, `SubmitButton` (`Pay {amount} now`).
  - Redirect providers (PayPal, Alipay, ...): `Cgv`, `SubmitButton` (`Go to our payment partner`).
  - BNPL (Flexpay/Uplift, Oney): the list is replaced by the panel, shown as separate cards: `Cgv` then `PaymentWidget`, which carries its own continue button.
- Not part of the CAPS form (host page): the hold-an-option card, the `Payment` heading, the trust badges, the summary sidebar and the bottom navigation.
- Not shown in these frames, kept in place for now: `CardInstallments`, `ContactChoice`, `Donation`, `Comments`.

### D8. The provider list owns the panel

`PaymentProviders` takes a `PaymentProviders.Panel` child. Its content (`BillingAddress`, `PaymentWidget`, `Cgv`, `SubmitSlot`) is rendered inside the selected provider's card instead of below the list, so the panel components only mount for the selected provider. The flow keeps declaring the components explicitly, so `validateComponents` still finds them through the element tree (a render prop or an internal wrapper would hide them). `FormPanel` becomes borderless inside a provider card through a context. For iframe providers the panel container sets `data-iframe`, which moves `Cgv` before the widget with a `group-data-*` Tailwind variant, since their widget submits on its own.

### D9. Provider logos come from the configuration

The BFF `configuration` of each provider gains an optional `logos: string[]`. Each entry is the name of an icon of the `Utilities` set of `@clubmed/trident-icons` (>= 1.24.0, for example `Visa`, `Mastercard`, `AmericanExpress`, `Ideal`), passed as is to `Icon`, in the received order. An unknown name renders nothing. The field is declared in the server model and in the generated SDK types. It is filled from the `logos` field of the Directus `caps_providers` collection (one list per provider, not per locale), read by `DirectusClient.getProviders` and exposed by `PaymentConfigService.getPaymentProvidersConfig` (`[]` when empty). The seed `packages/server/resources/directus_payment_providers.json` carries the lists.

### D10. Titles of the cascade

The section titles of the flow (`Choose the payment schedule`, `How do you want to pay?`) are Newsreader Bold 28px, centered (`text-h4`), as in the mockups. The titles inside the provider block (provider card title, `Billing address`, general terms) take the size of the schedule card titles (`text-b3 font-bold`, sans, left aligned): the 28px and 20px of the mockups were judged too big next to the cards. The payment widget has no title. The blocks of a panel are 40px apart. `Title` gets a `variant` (`default`, `section`, `label`) so the legacy flow keeps its style. The default copy of the three headings follows the mockups; the Directus copy still overrides it.

### D11. Stepper mode

The embed prop `stepper?: boolean` (default `false`, `theme="current"` only) reveals the form as the user goes. Nothing is added to the form fields or to `capsFormSchema`: the progress is read from the form values.

- Schedule: when the user has a choice (several schedule entries or an active BNPL option, outside the partial payment action), `amount` has no default value, so no card is selected and nothing else is shown.
- Payment methods: shown once `amount` is set. When several providers exist, `provider_id` has no default value either; with a single provider it stays preselected.
- Details: the panel of the selected provider (`CardInstallments`, `BillingAddress`, `PaymentWidget`, `ContactChoice`, `Comments`, `Cgv`) and the donation appear once a provider is selected. `ContactChoice` and `Comments` move into the panel so that they come after the choice and before the button.
- Submit: shown only while `formState.isValid` is true, hidden again as soon as any field becomes invalid. The PSP tokens are generated on input, so the form can be valid before the submit.

The reveal is a `Step` component (`name`: `providers`, `details`, `submit`) wrapping the elements of `CurrentFlow`, so `validateComponents` still sees every component. `CapsPaymentForm` provides a `StepperContext`: outside the stepper, `Step` renders its children unconditionally, so the `current` theme has a single flow and a single element order whether `stepper` is set or not. Known limit: going back from a BNPL card to a full payment card preselects the first provider (`ScheduleOptionsField`).

### D5. `validateComponents`

Legacy components keep their `COMPONENT_KEY`. The new components declare their own keys, and `validateComponents` accepts either complete set for the issuer.

### D6. PSP integrations

The PSP forms and widgets are rendered as they are inside the payment step. A variant dimension is added to the registry only if a PSP needs a different rendering.

### D7. Styles

The new UI's classes and tokens live in the existing Shadow DOM and do not modify the legacy styles.

## Risks / Trade-offs

- **Default value.** Without a `theme` prop and without a CMS key, the form renders `legacy`, so no existing host switches at deploy time. The switch to `current` is a CMS change per locale and issuer, with no release.
- **Theme known after one request.** Without the `theme` prop, `CapsPaymentForm` renders nothing until `GET /rest/payment_config` answers, then picks its flow. It is the request the form already makes, so it is cached and sent once. The app header and layout wait for the same endpoint.
- **Untrusted CMS value.** The Directus value is free JSON: the server drops a `theme` that is not `'legacy'` or `'current'`.
- **Two UIs to maintain** until the legacy removal. Mitigated by keeping the legacy copy frozen.
- **`validateComponents` and the skeleton derive from the same symbols**, so the skeleton must be checked for the new UI.
- **Props or component renames in `components/`** break `Meta<typeof Component>` stories. See the storybook note on StoryArgs.

## Migration Plan

1. Duplicate to `components/legacy/`, add `LegacyFlow` and the `theme` prop. Behaviour with `theme="legacy"` is identical to today.
2. Build the new `Flow` and its steps.
3. Roll out, then remove `components/legacy/`, `LegacyFlow` and the prop.

## Open Questions

- Hold-an-option card, trust badges and `Payment` heading: confirm they stay on the host page.
- Mockups of the `Pay {amount} now` and `Go to our payment partner` labels, the teal PayPal button (D 511 A B Step 4) and the `Same as main traveler` / collapsible additional information of the billing address.

### D12. One content per theme

`PaymentConfigProvider` serves a single content, chosen by its `theme` prop (default `'legacy'`): `contentByTheme.current` is `defaultContent`, `contentByTheme.legacy` is `defaultContent` with the three headings the redesign changed restored (`paymentProviders`, `paymentSchedule`, `cgv`). The host `content` is merged on top of that one object. The legacy texts therefore do not change, and components never see a mix of both themes.

### D13. Donation and the deposit

The donation is collected with the first payment. On a deposit card, the donation is added to the deposit only: the balance shown (`{deposit} + {balance}`) is the balance of the schedule, without the donation.
