## 1. Contract

- [x] 1.1 Add the `CapsEvent` union to `packages/sdk/src/embed/shared/types.ts` and replace `onReady`, `onLoadingChange` and `onError` by `onEvent` in `CapsFormCallbacks`
- [x] 1.3 Replace `FormCallbacks` in `src/contexts/FormCallbacksContext.ts` by `{ onEvent }`
- [x] 1.4 Add a type spec for the narrowing on `action` and `name`, and for the removed callbacks

## 2. Event emission in the SDK

- [x] 2.1 `CapsForm`: pass `onEvent` through the context instead of `onLoad`, `onLoadEnd` and `onError`
- [x] 2.2 `usePaymentSubmit` and `usePaymentRedirect`: emit `load`, `load_end` and `error`, and emit `submit` in the valid branch of `handleSubmit` (not on the token retry)
- [x] 2.3 Source `provider_id`, `amount` and `currency` of `submit` from the form values and the payment config, check the amount with a schedule and with BNPL
- [x] 2.4 Both `PaymentWidget/IframeView.tsx` (current and legacy): emit `load` and `load_end` for the third-party iframe and the cancellation, and check the auto-submit (D4 in `design.md`)
- [x] 2.5 `CapsPaymentForm`: forward `onEvent` (through `latest`), emit `redirect` in `onNavigate` after `onRedirect`, map theme and flow errors to `error` events, and isolate a throwing host handler
- [x] 2.6 Map payment errors to `FLOW_ERROR` with the BFF `error_description` (fetcher), without the PSP raw response

## 3. Webcomponent and MFE

- [x] 3.1 `CapsFormWebComponent`: forward `onEvent` by ref, emit `error` events for `REMOTE_LOAD_FAILED`, `PROTOCOL_MISMATCH` and `REACT_VERSION_UNSUPPORTED`
- [x] 3.2 `packages/mfe`: update `RemoteCapsForm.tsx` and `preview.tsx`
- [ ] 3.3 Check that events cross the shadow root and the Module Federation bridge (spec in `CapsFormWebComponent.spec.tsx`)

## 4. Tests

- [x] 4.1 Update `CapsPaymentForm.spec.tsx` and `flows.spec.tsx` for the new callbacks
- [x] 4.2 Specs: `submit` once on a valid form, none on an invalid one, none on a token retry, `redirect` skipped when `onRedirect` returns `false`
- [x] 4.3 Story with a `play` function that clicks "Pay" and asserts the `onEvent` call with `{ action: 'click', name: 'submit', data }`
- [x] 4.4 Run `pnpm check`, `pnpm lint`, `pnpm test`

## 5. Documentation and examples

- [x] 5.1 `docs/embed.md`: replace the old callbacks, add the "Tracking" section (event table, confirmation query params, `amount` number vs string, `payment_status` values, double counting warning)
- [x] 5.2 `packages/app`: `PaymentPage.tsx` handles the load, load_end and error events through `onEvent`
- [x] 5.3 `packages/embed-playground`: log every `onEvent` in the event panel
- [ ] 5.4 Update the CAPS portal documentation drafts (`update-caps-documentation` skill) once merged
