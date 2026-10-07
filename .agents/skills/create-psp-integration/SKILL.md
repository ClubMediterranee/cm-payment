---
name: create-psp-integration
description: Create or extend a PSP integration (payment service provider) in the @clubmed/caps SDK with the expected layout - src/integrations/<psp>/ with integration.config.ts (defineIntegration), ui.config.ts (definePspProvider), hooks, types, ui, tests and registration. Use when adding a payment provider, a hosted fields form, a PSP button or widget, or when moving PSP code into src/integrations.
---

# Create a PSP integration

A PSP integration lives in `packages/sdk/src/integrations/<psp>/`. Use `hipay` (hosted fields form) and `hipay-paypal` (button) as references, and read `packages/sdk/docs/integrations.md` for the current state of the registry.

## Layout

```
packages/sdk/src/integrations/<psp>/        # kebab-case, e.g. hipay-paypal
├── integration.config.ts                   # defineIntegration: mount point ids (only if the PSP mounts UI)
├── ui.config.ts                            # definePspProvider: component per provider id
├── hooks/                                  # <psp>.ts (SDK client) + use<Psp>….ts (React hook) + specs
├── types/                                  # <Psp>.ts: types of the PSP SDK, `declare global` for window.<Sdk>
└── ui/                                     # <Psp>Form.tsx / <Psp>Button.tsx + stories
```

Rules:

- Imports inside `src/integrations` are relative and end with `.js` (`'../hooks/useHipayHostedFields.js'`). Never import from `@clubmed/caps` inside the SDK.
- Code outside the integration never imports its `ui/` or `hooks/` directly: it goes through the registry (`getPspComponent`). Known exceptions are listed in `packages/sdk/docs/integrations.md`; do not add new ones.
- An integration imports nothing from another integration, except shared types of the same PSP family.
- The provider id is a member of `PspProviders` (`src/types/PspProviders.ts`), with the value returned by the payment providers API. Add it there if missing.

## Steps

### 1. Mount points — `integration.config.ts`

Only when the PSP SDK injects UI (hosted fields, button, widget) into elements it looks up by id.

```ts
import { defineIntegration } from '../../utils/integrations/defineIntegration.js';

export default defineIntegration({
  id: '<psp>', // folder name
  mountPoints: {
    cardNumber: '<psp>-card-number',
    cvc: '<psp>-card-cvc',
  },
});
```

- Prefix every id with the PSP name: in the webcomponent embed the elements are rendered in the light DOM of the host page, and ids must be unique across integrations (checked by `defineIntegration.spec.ts`).
- Register it in `src/integrations/index.ts`: `import './<psp>/integration.config.js';`.

### 2. PSP SDK types — `types/<Psp>.ts`

Types of the PSP SDK objects and events; `declare global { interface Window { … } }` for the global it exposes.

### 3. Hooks — `hooks/`

- `<psp>.ts`: thin wrapper creating the PSP client from its settings (no React).
- `use<Psp>HostedFields.ts` (or `use<Psp>.ts`): the React hook. Pattern of `useHipayHostedFields`:
  - settings with `usePaymentProviderSettings<{ script_url: string; … }>(PspProviders.<ID>)`;
  - script with `useScriptLoader(script_url)`;
  - create the client in an effect once the script is loaded, destroy it in the cleanup;
  - mount point ids come from the component (`fieldSelectors` parameter), never hard-coded in the hook;
  - write the token in the form: `setValue('token', { value, status: 'success' })`, `status: 'pending' | 'error'` while tokenizing;
  - return `{ errors, isReady }`.

### 4. UI — `ui/<Psp>Form.tsx`

Render the mount points with the SDK components so they work inside a shadow root (they are projected from the light DOM, see `usePspMountPoint`):

- hosted field: `<HostedField id={integration.mountPoints.cardNumber} label={…} error={…} isLoading={!isReady} />`;
- any other PSP container (button, widget): `<PspMountPoint id={integration.mountPoints.button} className="…" />`;
- never render a raw `<div id="…">` for a PSP container.

```tsx
import { FormPanel } from '../../../components/ui/FormPanel.js';
import { HostedField } from '../../../components/ui/HostedField.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { use<Psp>HostedFields } from '../hooks/use<Psp>HostedFields.js';
import integration from '../integration.config.js';

export const <Psp>Form = () => {
  const { content } = useCapsConfigContext();
  const { errors, isReady } = use<Psp>HostedFields({ fieldSelectors: integration.mountPoints });

  return (
    <FormPanel className="w-full">
      <div className="flex flex-wrap gap-28">
        <HostedField
          isLoading={!isReady}
          error={errors.cardNumber}
          label={content.creditCardForm.cardNumber}
          id={integration.mountPoints.cardNumber}
        />
      </div>
    </FormPanel>
  );
};
```

Labels come from `content` (`useCapsConfigContext`), never hard-coded.

### 5. Provider UI — `ui.config.ts`

```ts
import { PspProviders } from '../../types/PspProviders.js';
import { definePspProvider } from '../../utils/integrations/definePspProvider.js';
import { <Psp>Form } from './ui/<Psp>Form.js';

export default definePspProvider({
  id: PspProviders.<ID>,
  // kind: 'button', // default is 'form' (rendered by the payment widget); 'button' replaces the submit button
  component: <Psp>Form,
});
```

- One declaration per `(id, kind)`: a second one with the same pair replaces the first.
- Register it in `src/integrations/ui.ts`: `import './<psp>/ui.config.js';`.
- A form is displayed by `IntegratedView` when the provider `configuration.display_type` is `hosted_field` or `custom`.

### 6. Tests and stories

- `hooks/*.spec.ts(x)` beside the hooks. `vi.mock` paths are relative to the spec file: shared hooks are at `'../../../hooks/utils/<name>'`, not `'../../utils/<name>'`.
- Add the integration to `src/utils/integrations/defineIntegration.spec.ts` (expected mount points, in `PSP_IDS`) and its provider to `src/utils/integrations/definePspProvider.spec.tsx`.
- `ui/<Psp>Form.stories.tsx` with MSW handlers for `*/rest/payment_providers/*` and `*/rest/payment_config*` (see `HipayForm.stories.tsx`); title `Components/PaymentWidget/HostedFields/<Psp>Form`.

### 7. Verify

```bash
pnpm check
pnpm lint
pnpm test
```

Then check the form in the embed playground (`pnpm dev:mfe`, `pnpm dev:embed-playground`): the mount points must be children of `<caps-form>` (light DOM) and the PSP iframes injected in them.

## Checklist

- [ ] Folder `src/integrations/<psp>/` with `hooks/`, `types/`, `ui/`
- [ ] `PspProviders` has the provider id
- [ ] `integration.config.ts` (PSP-prefixed ids) imported in `src/integrations/index.ts`
- [ ] `ui.config.ts` imported in `src/integrations/ui.ts`
- [ ] Mount points rendered with `HostedField` / `PspMountPoint`
- [ ] No import of the integration from outside, no `@clubmed/caps` self-import, `.js` extensions
- [ ] Specs, registry specs updated, story
- [ ] `pnpm check`, `pnpm lint`, `pnpm test` pass
