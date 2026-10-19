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
  onReady={() => {}}
  onLoadingChange={(loading) => {}}
  onError={({ code, message }) => {}}
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

Error codes: `REMOTE_LOAD_FAILED`, `PROTOCOL_MISMATCH`, `REACT_VERSION_UNSUPPORTED`, `ORIGIN_NOT_ALLOWED`, `FLOW_ERROR`.

Section headings and the submit label of the webcomponent form can be overridden with `content={{ paymentSchedule: { heading: '…' }, submit: { label: 'Payer' } }}`; the other `content` keys are the SDK content keys.

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
  theme="current" // 'current' (default) | 'legacy'
  onError={({ code, message }) => {}} // payment errors are reported here, displaying them is up to the host
/>;
```

To render the donation or the submit button elsewhere in the page (a price ticket, a sidebar), give `CapsPaymentForm` the host elements with `slots`. They stay part of the form (same state, same validation):

```tsx
const [submit, setSubmit] = useState<HTMLElement | null>(null);

<CapsPaymentForm {...props} slots={{ submit }} />
<PriceTicket footer={<div ref={setSubmit} />} />
```

Until a slot has an element, its region renders in the form.

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
