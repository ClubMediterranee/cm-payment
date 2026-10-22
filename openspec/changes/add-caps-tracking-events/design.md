## Context

The embed contract (`src/embed/shared/types.ts`, dependency-free) exposes `onReady`, `onLoadingChange`, `onError` and `onRedirect`. Inside the SDK, `FormCallbacksContext` carries `onLoad`, `onLoadEnd` and `onError`, and `CapsPaymentForm` translates them to the embed callbacks. Navigation goes through `onNavigate` of `PaymentConfigProvider`, where `onRedirect` can veto the default `window.location.assign`.

The confirmation side of the tracking is already in place: `buildConfirmationUrl` (server) appends `payment_status`, `payment_amount`, `payment_currency`, `booking_id`, `provider_id`, `proposal_id` and `locale` to `callbackUrl`.

The embed has no user. The public API can be replaced without a compatibility layer.

## Goals / Non-Goals

**Goals:**

- One callback, one payload shape, enough for a host to track the journey.
- The same events for the legacy and the current themes, in the SDK and through the webcomponent / MFE.
- A host reading the confirmation query params gets the final status without any CAPS code.

**Non-Goals:**

- No `dataLayer` or analytics dependency in the SDK: the host owns the tracking.
- No change to the server or to `buildConfirmationUrl`.
- No event for each form step or field (only the five events of the tracking plan).

## Decisions

### D1: Replace the callbacks by `onEvent`, no compatibility

`CapsFormCallbacks` becomes `{ onEvent?: (event: CapsEvent) => void; onRedirect?: (url: string) => void | false }`. The internal `FormCallbacks` becomes `{ onEvent?: (event: CapsEvent) => void }`. `onReady`, `onLoadingChange`, `onLoad`, `onLoadEnd` and the two `onError` are removed, not deprecated.

`onReady` has no event in the tracking plan and is dropped too. A host that needs a "form interactive" signal can add a `ready` event later, as a new member of the union.

### D2: `CapsEvent` is a discriminated union on `action` and `name`

```ts
export type CapsEvent =
  | { action: ''; name: 'load' }
  | { action: ''; name: 'load_end' }
  | {
      action: 'click';
      name: 'submit';
      data: { provider_id: string; amount: number; currency: string };
    }
  | { action: ''; name: 'redirect'; data: { url: string } }
  | { action: ''; name: 'error'; data: { code: CapsEmbedErrorCode; message: string } };
```

`action` is `''` for non-user events, as in the tracking plan. It is the type that lives in the embed contract, so the SDK internals import it from there (the contract stays dependency-free). `amount` is a `number` here and a decimal string (`'1250.00'`) in the confirmation query params: documented in `embed.md`.

### D3: `onRedirect` stays separate from `onEvent`

`onRedirect` can return `false` to take over the navigation, which changes the behavior. `onEvent` stays fire-and-forget, so that a tracking handler can never alter the flow. The `redirect` event is emitted in `onNavigate` after `onRedirect` ran, and only when the navigation goes on (`onRedirect` did not return `false`). Rationale: a host that handled the navigation itself knows it and already got its URL.

### D4: Emission points

| Event               | Where                                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `load` / `load_end` | The moments of today's `onLoad` / `onLoadEnd` (payment request pending, request settled or cancelled, third-party iframe loading and cancel). It is the payment processing state, not the page load. |
| `click` `submit`    | `handleSubmit` of `usePaymentSubmit`, in the valid branch of `methods.handleSubmit`, right before `mutate`. The token retry calls `mutate` directly, so it does not emit a second `submit`.          |
| `redirect`          | `onNavigate` of `CapsPaymentForm` (see D3).                                                                                                                                                          |
| `error`             | Where `onError` is called today (mutation error, flow error boundary, theme loading), plus the webcomponent load failures.                                                                           |

`provider_id` and `amount` come from the form values (the amount of the selected schedule or BNPL option, not the booking total), `currency` from the payment config. The legacy `IframeView` submits automatically once the form is valid (`useEffect` on `isValid`): it goes through the same `handleSubmit`, so it emits `submit` too. Verified: in `IframeView` the auto-submit fires once the form is valid (provider chosen, CGV accepted) for iframe providers, with no click on a pay button, so `submit` is emitted at that moment. It is the user's last action before the PSP iframe loads, so it is kept as is. Revisit if the tracking team wants a strict click.

### D5: `error` data never exposes PSP internals

`error.data` is `{ code, message }` with `code` from `CapsEmbedErrorCode`. For payment errors the SDK maps the failure to `FLOW_ERROR`. The message is the `error_description` of the BFF response (the localized message the BFF builds for the user, already displayed by hosts), never the raw response of the PSP. No form value (card, address, email) goes in any `data`.

### D6: `onEvent` crosses the embed boundary like `onRedirect`

The webcomponent wrapper forwards `onEvent` to the remote as a prop and keeps using refs so that a new function does not remount the form. The wrapper emits its own `error` events for `REMOTE_LOAD_FAILED`, `PROTOCOL_MISMATCH` and `REACT_VERSION_UNSUPPORTED`. The protocol version stays at 1: no host runs a wrapper against a remote yet, so there is no mismatch to guard against.

### D7: The host owns the tracking

The SDK only exposes `onEvent`. `docs/embed.md` gets a "Tracking" section with the event table and the query params of the confirmation URL. No example pushes to a `dataLayer` for now: `packages/app` only consumes `onEvent` for its loader and error message, and `packages/embed-playground` logs every event.

## Risks / Trade-offs

- **Double counting** → `submit` is the click, not the payment. The doc says the confirmation `payment_status` is the only source of truth for conversions.
- **Two changes touch the same requirements** (`add-caps-redesigned-form` and this one) → this change builds on the text of the redesigned form and is archived after it.
- **Auto-submit in the legacy iframe flow** → see D4, checked during implementation.
- **Breaking change** → accepted, no host uses the embed yet.

## Open Questions

- Should a `ready` event replace `onReady` for hosts that show a skeleton? Not needed for tracking, left out for now.
