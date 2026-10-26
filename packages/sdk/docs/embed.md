# Embed the CAPS payment flow

`CapsFormWebComponent` (`@clubmed/caps/webcomponent`) embeds the whole CAPS payment flow in a React host (React `>=18`) without installing the SDK dependencies (trident-ui, Tailwind, react-query…) in the host application. The form renders in the page, inside a `<caps-form>` shadow root.

The entry imports nothing from the SDK: it only depends on `react`, `@module-federation/runtime` and `@module-federation/bridge-react`. The CAPS form itself is served at runtime by the CAPS server of the selected environment, so CAPS updates reach hosts without a republish.

Hosts that cannot load the remote can redirect the user to the CAPS payment page instead, see [Payment URL](#payment-url-redirect-mode).

## Props

```tsx
<CapsFormWebComponent
  env="production" // 'integration' | 'staging' | 'production' (default)
  url="https://localhost:8083" // optional, takes precedence over env
  issuerType="GO" // 'GM' | 'GO' | 'PARTNERS'
  type="proposal" // 'booking' | 'proposal'
  id="123456"
  customerId="789" // required for GO, PARTNERS and GM bookings
  locale="fr-FR"
  apiKey={apiKey} // CAPS API key of the flow: GM booking → CA key, GM proposal → BE key, GO and PARTNERS → their own key
  accessToken={token} // provided by the host, never written to the DOM nor to a URL
  callbackUrl="https://host.example/payment/confirmation"
  callbackUrlSeller="https://host.example/seller/confirmation"
  onEvent={({ action, name, data }) => {}} // tracking events, see "Tracking"
  onRedirect={(url) => {
    // return false to handle the navigation yourself
  }}
  fallback={<Spinner />}
/>
```

| Environment   | CAPS server                            |
| ------------- | -------------------------------------- |
| `production`  | `https://caps.api.clubmed`             |
| `staging`     | `https://staging.caps.api.clubmed`     |
| `integration` | `https://integration.caps.api.clubmed` |

Error codes (`data.code` of the `error` event): `REMOTE_LOAD_FAILED`, `PROTOCOL_MISMATCH`, `REACT_VERSION_UNSUPPORTED`, `ORIGIN_NOT_ALLOWED`, `FLOW_ERROR`.

Section headings and the submit label of the webcomponent form can be overridden with `content={{ paymentSchedule: { heading: '…' }, submit: { label: 'Payer' } }}`; the other `content` keys are the SDK content keys.

## Tracking

`onEvent` receives one object, `{ action, name, data }`, for every step of the payment page:

| `action` | `name`     | `data`                              | Emitted                                                                                  |
| -------- | ---------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `''`     | `load`     |                                     | The payment request starts                                                               |
| `''`     | `load_end` |                                     | The payment request ends (error or cancellation)                                         |
| `click`  | `submit`   | `{ provider_id, amount, currency }` | The user submitted a valid form, right before the payment request. `amount` is a number. |
| `''`     | `redirect` | `{ url }`                           | The flow is about to navigate (not emitted when `onRedirect` returns `false`)            |
| `''`     | `error`    | `{ code, message }`                 | A payment or loading error                                                               |

`onEvent` is fire-and-forget: its return value is ignored and an exception thrown by your handler does not interrupt the payment. `onRedirect` stays separate because it can take over the navigation.

`submit` is a click, not a payment: a user can submit and be refused. The result arrives as query parameters on your `callbackUrl`:

```
https://host.example/confirmation?payment_status=OK&payment_amount=1250.00&payment_currency=EUR
  &booking_id=…&provider_id=…&proposal_id=…&locale=fr-FR
```

`payment_status` is one of `OK`, `PENDING`, `REFUSED_PSP`, `REFUSED_CM` or `CANCELED`. Count a conversion from the confirmation page only, to avoid counting a submit that was refused. `payment_amount` is a decimal string, whereas `amount` of `submit` is a number.

## Without the webcomponent

Hosts that install the SDK (React `>=19`, trident-ui, an `IconsProvider`) can render the same flow, with the same props as the federated form (without `slots`), in their own DOM:

```tsx
import { CapsPaymentForm } from '@clubmed/caps';

<CapsPaymentForm
  capsUrl="https://caps.api.clubmed"
  apiKey={apiKey}
  issuerType="GM"
  type="booking"
  id="123"
  accessToken={token}
  callbackUrl="https://host.example/payment/confirmation"
  theme="current" // optional: 'current' | 'legacy', defaults to 'legacy'
  onEvent={({ action, name, data }) => {}} // payment errors are reported as `error` events, displaying them is up to the host
/>;
```

## Theme

The `theme` prop (`'legacy'` or `'current'`) picks the UI the form renders, and defaults to `'legacy'`. The SDK does not read it from anywhere else: the host decides, from its own configuration, a feature flag or a URL parameter.

The form serves one set of default texts, the one of the theme: the `'legacy'` texts are unchanged, and `content` overrides are merged on top of them.

The `'current'` theme reveals the form step by step: each block shows once the fields before it are valid, and the submit button shows once the whole form is valid.

## Webcomponent mode

```tsx
'use client';
import { CapsFormWebComponent } from '@clubmed/caps/webcomponent';
```

- The form is rendered through `@module-federation/bridge-react`: the remote mounts its own React root in a host DOM node, so nothing is shared with the host (React 18 and 19 hosts are supported). The SDK, trident-ui v1 and Tailwind CSS are bundled in the remote.
- `className` and `style` apply to the host container of the form.
- Styles live in a shadow root: host styles do not reach CAPS and CAPS styles do not reach the host. Nothing to add to the host Tailwind configuration.
- The host owns the authentication and passes `apiKey` and `accessToken`. The remote does not fetch the API key from the CAPS server.
- One CAPS form per page.
- The donation and the submit button can be rendered elsewhere in the page (a sidebar, a sticky footer) with `CapsFormSlot`. They stay part of the CAPS form (same state, same validation) and render in their own style-isolated shadow root; without a slot they render inside the form:

  ```tsx
  import { CapsFormSlot, CapsFormWebComponent } from '@clubmed/caps/webcomponent';

  <main><CapsFormWebComponent {...flowProps} /></main>
  <aside>
    <CapsFormSlot name="donation" />
    <CapsFormSlot name="submit" />
  </aside>
  ```

- webpack 5, Vite and Next.js are supported. With Next.js the server renders `fallback` only; the form is loaded after hydration.

## Payment URL (redirect mode)

`getPaymentUrl` (exported by `@clubmed/caps`) builds the URL of the CAPS payment page, to redirect the user to the full-page flow.

```ts
import { getPaymentUrl } from '@clubmed/caps';

window.location.assign(
  getPaymentUrl('production', {
    issuerType: 'GO',
    proposalId: '123456', // or bookingId
    customerId: '789', // required for GO, PARTNERS and GM bookings
    locale: 'fr-FR', // defaults to the browser language, then fr-FR
    callbackUrl: 'https://host.example/payment/confirmation', // defaults to the CAPS confirmation page
    backUrl: 'https://host.example/cart', // defaults to the current page
    extraParams: { action: 'deposit' },
  }),
);
```

## Host checklist

1. Ask the CAPS team to allow your origin (per environment). Origins are administered in the CMS API (`caps_allowed_origins`).
2. Content Security Policy of the host: `script-src` and `connect-src` the CAPS server, `style-src`/`font-src` `https://fonts.googleapis.com https://fonts.gstatic.com`, and the PSP domains (Cybersource, HiPay, PayPal…).
3. Provide an OIDC access token for seller flows (GO, PARTNERS) and for GM bookings.
4. Handle the `callbackUrl` (and `callbackUrlSeller`) routes: the user lands there after the payment.
