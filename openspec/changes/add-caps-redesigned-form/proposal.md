## Why

The CAPS payment form gets a redesigned UI: the payment schedule is shown as cards, then the payment method is chosen, and the form is displayed step by step instead of as one long page. The BFF, the Directus content and the form logic stay the same. Hosts that already embed the MFE must be able to keep the current UI during the transition and move to the new one on their own schedule.

## What Changes

- Move the current form components of `@clubmed/caps` to `packages/sdk/src/components/legacy/` (`git mv`, history kept) and expose them under explicit legacy names.
- Add the redesigned, step-by-step components at the root of `packages/sdk/src/components/`, with the same names as today (`PaymentSchedule`, `PaymentProviders`, ...). The public exports of `src/index.ts` point to them.
- Add a `theme?: 'legacy' | 'current'` prop to `CapsFormProps` (default `'current'`). `'legacy'` renders the frozen UI, `'current'` renders the UI at the root of `components/`. The MFE `RemoteCapsForm` picks `LegacyFlow` or the new `Flow` from it.
- Adapt `validateComponents` so that both component sets satisfy the per-issuer required components.
- Reuse the PSP integrations (`definePspProvider`) as they are in the payment step.
- Document the removal of `components/legacy/`, `LegacyFlow` and the prop once every host has migrated.

## Capabilities

### New Capabilities

- `caps-redesigned-form`: The step-by-step form UI. It covers the step sequence, the per-step validation, the reuse of the existing form fields and schema, and the coexistence with the legacy UI.

### Modified Capabilities

- `caps-embed-contract`: `CapsFormProps` gains the optional `theme` prop (`'legacy' | 'current'`, default `'current'`).
- `caps-webcomponent-embed`: the props forwarded to the remote include `theme`, and the remote renders the matching flow.

## Impact

- `packages/sdk`: `src/components/**` (move and new components), `src/providers/CapsForm.tsx` (`validateComponents`), `src/index.ts`, `src/embed/shared/types.ts`.
- `packages/mfe`: `src/RemoteCapsForm.tsx` (`LegacyFlow` and new `Flow`).
- `packages/app`: imports of the moved components, which keeps using the legacy ones until it is migrated.
- Stories, specs and the embed playground (toggle between both UIs).
- **BREAKING** for existing hosts: without `theme`, they get the new UI. See the open decision in `design.md` (default value and rollout).
