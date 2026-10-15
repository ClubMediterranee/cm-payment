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

### D2. The switch is a prop on the embed contract

`CapsFormProps.theme?: 'legacy' | 'current'` (default `'current'`), forwarded to `RemoteCapsForm`, which renders `LegacyFlow` (the current `Flow`, extracted unchanged) or the new `Flow`. The prop is optional, so no protocol major bump. The providers (`ShadowHost`, `PaymentConfigProvider`, `Form`) are shared.

### D3. Duplication first, no shared hooks

The current components are duplicated into `components/legacy/` as they are. The logic stays inside the components: no headless hooks are extracted, so the refactor of the root components can change both logic and rendering freely.

### D4. Step navigation

The new `Flow` holds a local step index. Going to the next step calls react-hook-form `trigger` on the fields of the current step. The final submit is the existing `usePaymentSubmit`. The form fields (`amount`, `provider_id`, `payment_condition_id`, ...) and `capsFormSchema` are unchanged.

### D5. `validateComponents`

Legacy components keep their `COMPONENT_KEY`. The new components declare their own keys, and `validateComponents` accepts either complete set for the issuer.

### D6. PSP integrations

The PSP forms and widgets are rendered as they are inside the payment step. A variant dimension is added to the registry only if a PSP needs a different rendering.

### D7. Styles

The new UI's classes and tokens live in the existing Shadow DOM and do not modify the legacy styles.

## Risks / Trade-offs

- **Default value (open decision).** With `theme` absent meaning `current` (the new UI), every existing host switches at deploy time. Either accept it and mark the commit `BREAKING CHANGE:`, or ship first with the default on legacy and invert it in a second commit. To be settled before merging.
- **Two UIs to maintain** until the legacy removal. Mitigated by keeping the legacy copy frozen.
- **`validateComponents` and the skeleton derive from the same symbols**, so the skeleton must be checked for the new UI.
- **Props or component renames in `components/`** break `Meta<typeof Component>` stories. See the storybook note on StoryArgs.

## Migration Plan

1. Duplicate to `components/legacy/`, add `LegacyFlow` and the `theme` prop. Behaviour with `theme="legacy"` is identical to today.
2. Build the new `Flow` and its steps.
3. Roll out, then remove `components/legacy/`, `LegacyFlow` and the prop.

## Open Questions

- Default value of `theme` and the rollout order (see Risks).
- Final list and order of the steps, and which fields belong to each step. To be confirmed from the design mockups.
