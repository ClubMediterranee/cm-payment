# Embed the CAPS payment flow

Two portable React wrappers embed the whole CAPS payment flow without installing the SDK dependencies (trident-ui, Tailwind, react-query…) in the host application:

| Import                       | Component              | Host requirements                             | Rendering                                       |
| ---------------------------- | ---------------------- | --------------------------------------------- | ----------------------------------------------- |
| `@clubmed/caps/webcomponent` | `CapsFormWebComponent` | React `>=18` (nothing shared)                 | In the page, inside a `<caps-form>` shadow root |
| `@clubmed/caps/iframe`       | `CapsFormIFrame`       | Any React version supported by the peer range | In an `<iframe>` served by CAPS                 |

Neither entry imports anything from the SDK: they only depend on `react` (and `@module-federation/runtime` + `@module-federation/bridge-react` for the webcomponent entry). The CAPS form itself is served at runtime by the CAPS server of the selected environment, so CAPS updates reach hosts without a republish.

## Common props

```tsx
<CapsFormWebComponent
  env="production" // 'integration' | 'staging' | 'production' (default)
  url="https://localhost:8083" // optional, takes precedence over env
  issuerType="GO" // 'GM' | 'GO' | 'PARTNERS'
  type="proposal" // 'booking' | 'proposal'
  id="123456"
  customerId="789" // required for GO and PARTNERS
  locale="fr-FR"
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

Error codes: `REMOTE_LOAD_FAILED`, `PROTOCOL_MISMATCH`, `REACT_VERSION_UNSUPPORTED`, `AUTH_REQUIRED`, `ORIGIN_NOT_ALLOWED`, `FLOW_ERROR`.

Section titles of the webcomponent form can be overridden with `content={{ embed: { paymentSchedule: '…', submit: 'Payer' } }}`; other `content` keys are the SDK content keys.

## Webcomponent mode

```tsx
'use client';
import { CapsFormWebComponent } from '@clubmed/caps/webcomponent';
```

- The form is rendered through `@module-federation/bridge-react`: the remote mounts its own React root in a host DOM node, so nothing is shared with the host (React 18 and 19 hosts are supported). The SDK, trident-ui v1 and Tailwind CSS are bundled in the remote.
- `className` and `style` apply to the host container of the form.
- Styles live in a shadow root: host styles do not reach CAPS and CAPS styles do not reach the host. Nothing to add to the host Tailwind configuration.
- The host owns the authentication and passes `accessToken`.
- One CAPS form per page.
- webpack 5, Vite and Next.js are supported. With Next.js the server renders `fallback` only; the form is loaded after hydration.

## Iframe mode

```tsx
'use client';
import { CapsFormIFrame } from '@clubmed/caps/iframe';

<CapsFormIFrame {...flowProps} env="production" />;
```

- The iframe height follows the content (`height` disables the auto-resize).
- Club Med SSO works inside the frame. When `accessToken` is provided, it is sent to the frame through a `postMessage` handshake and no sign-in happens; without it the frame signs in (popup fallback when third-party cookies block the in-frame sign-in, then `AUTH_REQUIRED`).
- PSP and confirmation redirects navigate the host window (`onRedirect` can take over).
- Use it when the host cannot load a remote at runtime (strict CSP without the CAPS origin in `script-src`), or for non-React hosts later.

## Payment URL (redirect mode)

`getPaymentUrl` (exported by `@clubmed/caps`) builds the URL of the CAPS payment page, to redirect the user to the full-page flow. `CapsFormIFrame` uses it to build its `src`.

```ts
import { getPaymentUrl } from '@clubmed/caps';

window.location.assign(
  getPaymentUrl('production', {
    issuerType: 'GO',
    proposalId: '123456', // or bookingId
    customerId: '789', // required for GO and PARTNERS
    locale: 'fr-FR', // defaults to the browser language, then fr-FR
    callbackUrl: 'https://host.example/payment/confirmation', // defaults to the CAPS confirmation page
    backUrl: 'https://host.example/cart', // defaults to the current page
    extraParams: { action: 'deposit' },
  }),
);
```

## Host checklist

1. Ask the CAPS team to allow your origin (per environment). Origins are administered in the CMS API (`caps_allowed_origins`, modes `webcomponent` and/or `iframe`).
2. Content Security Policy of the host:
   - webcomponent: `script-src` and `connect-src` the CAPS server, `style-src`/`font-src` `https://fonts.googleapis.com https://fonts.gstatic.com`, and the PSP domains (Cybersource, HiPay, PayPal…);
   - iframe: `frame-src` the CAPS server.
3. Provide an OIDC access token for seller flows (GO, PARTNERS) and for GM bookings.
4. Handle the `callbackUrl` (and `callbackUrlSeller`) routes: the user lands there after the payment.
