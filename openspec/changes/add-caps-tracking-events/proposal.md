## Why

Hosts need to track the CAPS payment journey (analytics, conversion pixels). Today the embed exposes four unrelated callbacks (`onReady`, `onLoadingChange`, `onError`, `onRedirect`) and none of them tells the host that the user clicked "Pay", with which provider and for which amount. The SDK has a second, internal set (`onLoad`, `onLoadEnd`, `onError`) that is not part of the contract. The embed has no user yet, so the API can be reshaped now without a migration.

## What Changes

- **BREAKING** Replace `onReady`, `onLoadingChange` and `onError` of `CapsFormCallbacks` by a single `onEvent({ action, name, data })` callback. `onRedirect` stays, because its `false` return value lets the host take over the navigation.
- Export a discriminated union `CapsEvent` from `src/embed/shared/types.ts`:
  - `load` and `load_end`: the payment request starts and ends (same moments as today's `onLoad` and `onLoadEnd`);
  - `click` / `submit` with `{ provider_id, amount, currency }`: emitted once the form is valid, right before the PSP call, with the amount actually paid (schedule and BNPL aware);
  - `redirect` with `{ url }`: informational, emitted just before the navigation, after `onRedirect` has not vetoed it;
  - `error` with `{ code, message }`: never contains raw PSP details or personal data.
- **BREAKING** Replace the internal `FormCallbacks` (`onLoad`, `onLoadEnd`, `onError`) by a single `onEvent`, consumed by `usePaymentSubmit`, `usePaymentRedirect`, `CapsForm`, the legacy and current flows and both `IframeView`.
- The webcomponent wrapper reports its own load failures (`REMOTE_LOAD_FAILED`, `PROTOCOL_MISMATCH`, `REACT_VERSION_UNSUPPORTED`) as `error` events.
- Document the tracking in `docs/embed.md`: the event table, and the query params (`payment_status`, `payment_amount`, `payment_currency`) that the server already puts on `callbackUrl`, nothing to change there.
- Switch `packages/app` to `onEvent` and log every event in `packages/embed-playground`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `caps-embed-contract`: `CapsFormProps` swaps three callbacks for `onEvent`, and the contract exports the `CapsEvent` type with its payload rules.
- `caps-webcomponent-embed`: the callbacks requirement describes `onEvent`, and load failures are reported as `error` events instead of `onError` calls.

## Impact

- `packages/sdk`: `src/embed/shared/types.ts`, `src/contexts/FormCallbacksContext.ts`, `src/providers/CapsForm.tsx`, `src/hooks/usePaymentSubmit.ts`, `src/hooks/data/usePaymentRedirect`, `src/components/CapsPaymentForm/CapsPaymentForm.tsx`, both `PaymentWidget/IframeView.tsx`, `src/embed/webcomponent/CapsFormWebComponent.tsx`, `docs/embed.md`.
- `packages/mfe`: `src/RemoteCapsForm.tsx`, `src/preview.tsx`.
- `packages/app`: `PaymentPage.tsx`.
- `packages/embed-playground`: `src/App.tsx` (event log).
- Specs, stories with `play` functions and docs.
- Breaking for the embed API, with no migration: the embed is not used by any host yet.
- Depends on `add-caps-redesigned-form` (same files and the same two requirements). Archive that change first, or rebase the deltas.
