# PSP integrations

Each payment service provider (PSP) lives in `src/integrations/<psp>/` and is declared with two helpers:

| Helper              | File                    | Declares                                                           | Read with                                 |
| ------------------- | ----------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `defineIntegration` | `integration.config.ts` | The ids of the elements where the PSP SDK mounts its UI            | `getIntegrationConfig`, `getIntegrations` |
| `definePspProvider` | `ui.config.ts`          | The component rendered for a provider id (`kind`: `form`/`button`) | `getPspComponent(id, kind)`               |

The configs are registered by side-effect imports: `src/integrations/index.ts` (integration configs) and `src/integrations/ui.ts` (provider UIs).

## Current state

| Integration    | `integration.config.ts` | `ui.config.ts`      | UI resolved through the registry                          |
| -------------- | ----------------------- | ------------------- | --------------------------------------------------------- |
| `cybersource`  | yes                     | form `MCYBERSOURCE` | yes (`IntegratedView`)                                    |
| `hipay`        | yes                     | form `MHIPAY`       | yes (`IntegratedView`)                                    |
| `ixopay`       | yes                     | form `EIXOPAY`      | yes (`IntegratedView`)                                    |
| `wechat`       | no (no mount point)     | form `M99BILLW`     | yes (`IntegratedView`)                                    |
| `hipay-paypal` | yes                     | button `MHIPAYPP`   | **no**: registered, but imported directly                 |
| `uplift`       | yes                     | **missing**         | **no**: `UpliftForm` and `UpliftOption` imported directly |
| `oney`         | no (no mount point)     | **missing**         | **no**: `OneyOption` imported directly                    |

## Hard-coded imports to replace by the registry

Places outside `src/integrations/` that import an integration directly, or branch on a provider id, instead of going through the registry.

### 1. PayPal button — `src/components/SubmitButton.tsx`

- Line 11: `import { HipayPaypalButton } from '../integrations/hipay-paypal/ui/HipayPaypalButton.js'` (marked with a `TODO`).
- Line 39: rendered for any provider whose `category_payment_method` is `Paypal` when `is_paypal_button_enabled` is on.
- The button is already registered (`hipay-paypal/ui.config.ts`, kind `button`) but never read.
- Target: `getPspComponent(watchedProvider.id, 'button')`. To check first: the API returns `MHIPAYPP` for PayPal.

### 2. Third-party iframe form — `src/components/PaymentWidget/IframeView.tsx`

- Line 14: `import { UpliftForm } from '../../integrations/uplift/ui/UpliftForm.js'`.
- Lines 16–18: local registry `thirdPartyIframeRegistry = { [PspProviders.MUPLIFT]: UpliftForm }`, read line 70.
- Target: a `uplift/ui.config.ts` with a dedicated kind (for example `iframe`), read with `getPspComponent(id, 'iframe')`. Do not register it as `form`: `IntegratedView` would render it for `hosted_field` / `custom` providers.

### 3. Buy now pay later options — `src/components/PaymentSchedule/BnplOption.tsx`

- Lines 3–4: direct imports of `OneyOption` and `UpliftOption`.
- Lines 6–9: local registry `BNPL_OPTION_COMPONENTS` (`EHIPAYBNPL`, `MUPLIFT`), read line 19.
- These components take props (`provider`, `name`, `onChange`), while `definePspProvider` only accepts components without props.
- Target: a dedicated kind (for example `bnpl-option`) with a typed component per kind.

### 4. Token request — `src/hooks/data/useRequestToken.ts`

- Line 8: imports `CybersourceConfig` and `CybersourceTokenResponse` from `integrations/cybersource/types`.
- Lines 13, 17, 26: provider maps typed with `PspProviders.MCYBERSOURCE` only.
- Line 47: `if (providerId === PspProviders.MCYBERSOURCE)` decodes the Cybersource token inside the generic hook.
- Target: move the token decoding to the Cybersource integration (a `select` function exposed by the integration).

### 5. Iframe heights — `src/utils/iframe/getIframeHeight.ts`

- Lines 4–5: heights per provider id (`EGLOBALCOLLECT`, `EPAYGATE`), for providers that have no integration folder.
- Target: an option of the provider declaration (for example `iframeHeight`), if these providers get an integration.

### 6. Registration lists — `src/integrations/index.ts` and `src/integrations/ui.ts`

- Both files list the configs by hand: a new integration is not registered until it is added to them.
- `src/index.ts` (lines 1–2) and `src/components/PaymentWidget/IntegratedView.tsx` (line 2) import these lists for their side effects. This is expected, but a component that reads the registry without one of these imports gets an empty registry (tests, stories).

## Other points

- `Hipay.ts` (the HiPay SDK types) is in `src/integrations/ixopay/types/`; `hipay` and `hipay-paypal` import it from there. It belongs to `src/integrations/hipay/types/`.
- `getIntegrationConfig` and `getIntegrations` are only called by tests: the components import their `integration.config.ts` directly.
- Provider ids passed by an integration to its own hooks (`usePaymentProviderSettings(PspProviders.HIPAY)`) are fine: they stay inside the integration folder.
