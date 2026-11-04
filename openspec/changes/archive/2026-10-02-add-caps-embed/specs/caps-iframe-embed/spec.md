## ADDED Requirements

### Requirement: Iframe sub-path export

`@clubmed/caps` SHALL expose the `./iframe` sub-path, which exports `CapsFormIFrame` and re-exports the contract types. The entry SHALL be marked `'use client'`. It SHALL NOT depend on `@module-federation/runtime`. It SHALL work with any React version supported by the SDK peer range.

#### Scenario: Iframe entry has no federation dependency

- **WHEN** a host bundles `@clubmed/caps/iframe`
- **THEN** its bundle contains no Module Federation runtime code

### Requirement: Iframe source URL

`CapsFormIFrame` SHALL render an `<iframe>` whose `src` is `buildCapsFlowUrl(resolveCapsUrl(props), props, { embedded: '1', parent_origin: window.location.origin })`. It SHALL set `allow="payment"` and a non-empty `title`. It SHALL rebuild `src` only when a flow-identifying prop changes: `issuerType`, `type`, `id`, `customerId`, `locale`, `env` or `url`.

#### Scenario: Token not in the iframe URL

- **WHEN** `CapsFormIFrame` is rendered with an `accessToken`
- **THEN** the iframe `src` does not contain the token

### Requirement: Handshake

The embedded app SHALL post `CAPS_READY` to the parent once it is loaded, targeting the validated `parent_origin`. The wrapper SHALL answer with `CAPS_INIT { accessToken?, content? }`, targeting the CAPS origin. When `accessToken` changes, the wrapper SHALL send a new `CAPS_INIT`. When `CAPS_INIT` carries an `accessToken`, the app SHALL use it for API calls and SHALL NOT start an OIDC sign-in.

#### Scenario: Seller flow authenticated by the host

- **WHEN** a GO host renders `CapsFormIFrame` with `issuerType="GO"` and a valid `accessToken`
- **THEN** the embedded app calls the API with `Authorization: Bearer <token>` and never redirects to the IdP

### Requirement: SSO through the iframe

When authentication is required and no `accessToken` is received within the handshake window, the embedded app SHALL authenticate with its own OIDC client inside the iframe:

- the authorize redirect and the `/:issuer/signin_redirect` callback happen in the frame, on the CAPS origin;
- the `return_url` SHALL preserve `embedded` and `parent_origin`.

If in-frame sign-in cannot complete, the app SHALL fall back to `signinPopup`. If the popup is blocked or cancelled, it SHALL post `CAPS_ERROR { code: 'AUTH_REQUIRED' }` and show a sign-in call to action instead of a blank frame.

#### Scenario: Existing Club Med SSO session

- **WHEN** a user already signed in to the Club Med IdP opens a GO flow in `CapsFormIFrame` without `accessToken`
- **THEN** the frame completes the OIDC flow without asking for credentials and returns to the payment step in embedded mode (no header or footer)

#### Scenario: No IdP session visible in the frame

- **WHEN** the browser blocks third-party cookies and in-frame sign-in cannot reuse the IdP session
- **THEN** the app opens a sign-in popup, and on success the frame continues with the obtained token

#### Scenario: Popup blocked

- **WHEN** the popup cannot be opened
- **THEN** the app posts `CAPS_ERROR { code: 'AUTH_REQUIRED' }` and the wrapper calls `onError` with that code

### Requirement: Strict origin checks

The embedded app SHALL accept `parent_origin` only if it is in the server allow-list exposed by `/rest/embed/config`. It SHALL post messages only to that origin, never to `'*'`. The wrapper SHALL ignore messages whose `event.origin` differs from the CAPS origin, or whose `event.source` is not its own iframe window. The same rule SHALL apply to the existing PSP bridge (`sendIframeMessage` and `iframe-redirect.ejs`), which SHALL target the CAPS origin instead of `'*'`.

#### Scenario: Message from another frame

- **WHEN** another iframe on the host page posts `{ source: 'caps', type: 'CAPS_PAYMENT_REDIRECT', url }`
- **THEN** `CapsFormIFrame` ignores it

#### Scenario: Parent not allow-listed

- **WHEN** the app is loaded with `embedded=1` and a `parent_origin` that is not allow-listed
- **THEN** the app does not post any message, and shows an "integration not allowed" error

### Requirement: Auto-resize

The embedded app SHALL observe its document height with a `ResizeObserver` and post `CAPS_RESIZE { height }` when the height changes. The wrapper SHALL apply that height to the iframe. The wrapper SHALL also accept an explicit `height` prop that disables auto-resize.

#### Scenario: Step expands

- **WHEN** the payment widget step opens and the content grows by 400px
- **THEN** the iframe height grows accordingly and no inner scrollbar is shown

### Requirement: Top-level navigation forwarding

In embedded mode, every navigation that would change `window.location` of the embedded app SHALL be forwarded to the parent as `CAPS_PAYMENT_REDIRECT { url }`. This covers:

- PSP redirection;
- the auto-submitted PSP form, whose `action` URL and fields SHALL be forwarded as a GET-able URL or as `CAPS_PAYMENT_REDIRECT { url, method: 'POST', fields }`;
- redirection to the confirmation or callback URL.

The wrapper SHALL call `onRedirect(url)`. Unless `onRedirect` returns `false`, it SHALL perform the navigation on the top window, submitting a form for POST redirects.

#### Scenario: Confirmation redirect

- **WHEN** a payment completes inside the embedded app
- **THEN** the host top window navigates to the `callbackUrl`, and the confirmation does not render inside the iframe

#### Scenario: PSP inner iframe redirect

- **WHEN** the PSP iframe inside the embedded app posts `CAPS_PAYMENT_REDIRECT`
- **THEN** the embedded app forwards it to the parent instead of setting `window.location.href`

### Requirement: Embedded presentation

When `embedded=1`, the app SHALL NOT render its `Header`, `Footer` or immersive breadcrumb. It SHALL render on a transparent background with no body margin. It SHALL forward loading state as `CAPS_LOADING { loading }` and errors as `CAPS_ERROR { code, message }`. The wrapper SHALL map these messages to `onLoadingChange` and `onError`, and SHALL call `onReady` on `CAPS_READY`.

#### Scenario: Standalone app unchanged

- **WHEN** the app is opened without `embedded=1`
- **THEN** the header, footer and OIDC auto sign-in behave exactly as before
