# caps-embed-contract Specification

## Purpose

Shared, dependency-free contract of the CAPS embed wrappers: props, environment URLs, flow URL building and the versioned postMessage protocol between the host, the remote form and the iframe.

## Requirements

### Requirement: Dependency-free embed contract

The embed contract module (`packages/sdk/src/embed/shared`) and both wrapper entries (`@clubmed/caps/webcomponent`, `@clubmed/caps/iframe`) SHALL NOT import any module of the SDK outside `src/embed/**`. They also SHALL NOT import trident-ui, trident-icons, Tailwind CSS, react-query, react-hook-form or zod. Only `react`, `react/jsx-runtime` and, for the webcomponent entry only, `@module-federation/runtime` and `@module-federation/bridge-react/base` are allowed as runtime imports.

#### Scenario: Lint rejects a forbidden import

- **WHEN** a file under `packages/sdk/src/embed/**` imports a module outside `src/embed/**` (for example `../../providers/PaymentConfigProvider`) or a forbidden package
- **THEN** `pnpm lint` (oxlint) fails with a `no-restricted-imports` error

#### Scenario: Built entries only reference allowed packages

- **WHEN** the SDK is built
- **THEN** a build check parses `dist/embed/**` and the chunks they import
- **AND** fails if any bare import other than `react`, `react/jsx-runtime` or `@module-federation/runtime` is found, or if any CSS asset is referenced

### Requirement: Flow props type

The contract SHALL export a `CapsFormProps` type describing a CAPS flow. It contains:

- `issuerType` (`'GM' | 'GO' | 'PARTNERS'`), `type` (`'booking' | 'proposal'`), `id`, `callbackUrl` (required);
- `customerId` (required when `issuerType` is `'GO'` or `'PARTNERS'`);
- optional `locale`, `accessToken`, `callbackUrlSeller`, `action`, `reference`, `uuid` and `content`;
- the environment selectors `env` and `url`;
- the callbacks `onReady`, `onLoadingChange`, `onError` and `onRedirect`;
- the presentation props `className`, `style` and `fallback`.

The issuer values SHALL be string literals equal to the SDK `OidcIssuerTypes` enum values, so the two are interchangeable.

#### Scenario: customerId is required for sellers

- **WHEN** a consumer renders a wrapper with `issuerType="GO"` and no `customerId`
- **THEN** TypeScript reports a type error

#### Scenario: GM flow without customerId

- **WHEN** a consumer renders a wrapper with `issuerType="GM"` and no `customerId`
- **THEN** the code type-checks

### Requirement: Environment URL resolution

The contract SHALL export `CAPS_ENV_URLS` and `resolveCapsUrl({ env, url })`. `CAPS_ENV_URLS` SHALL map:

- `production` to `https://caps.api.clubmed`;
- `staging` to `https://staging.caps.api.clubmed`;
- `integration` to `https://integration.caps.api.clubmed`. An explicit `url` SHALL take precedence over `env`. `env` SHALL default to `'production'`. The resolved URL SHALL have no trailing slash.

#### Scenario: Explicit URL wins

- **WHEN** `resolveCapsUrl({ env: 'production', url: 'https://localhost:8083/' })` is called
- **THEN** it returns `https://localhost:8083`

#### Scenario: Environment lookup

- **WHEN** `resolveCapsUrl({ env: 'staging' })` is called
- **THEN** it returns `https://staging.caps.api.clubmed`

#### Scenario: Default environment

- **WHEN** `resolveCapsUrl({})` is called
- **THEN** it returns `https://caps.api.clubmed`

#### Scenario: Unknown environment

- **WHEN** `resolveCapsUrl` is called with an `env` that is not in `CAPS_ENV_URLS` and no `url`
- **THEN** it throws an error naming the unknown environment

### Requirement: Flow URL builder

The contract SHALL export `buildCapsFlowUrl(baseUrl, props, extraParams?)`. It returns `<baseUrl>/<issuer lower-case>/<type>/<id>`, with query parameters:

- `locale` (defaulting to `navigator.language`, then `fr-FR`);
- `customer_id`, `callback_url`, `callback_url_seller`, `action`, `reference` and `uuid` when defined;
- any `extraParams`.

It SHALL throw when `issuerType` is not `GM` and `customerId` is missing. It SHALL never include `accessToken` in the URL. The existing SDK `getPaymentUrl` (upper-case issuer path, no callback parameters) SHALL keep its current output for backward compatibility.

#### Scenario: Booking flow URL

- **WHEN** `buildCapsFlowUrl('https://caps.example', { issuerType: 'GM', type: 'booking', id: '123', locale: 'fr-FR', callbackUrl: 'https://host/cb' })` is called
- **THEN** it returns `https://caps.example/gm/booking/123?locale=fr-FR&callback_url=https%3A%2F%2Fhost%2Fcb`

#### Scenario: Token never leaks into the URL

- **WHEN** props contain `accessToken`
- **THEN** the returned URL contains no parameter carrying the token

### Requirement: Versioned message protocol

The contract SHALL export `CAPS_PROTOCOL_VERSION` (an integer) and the message type constants:

- `CAPS_READY`, `CAPS_INIT`, `CAPS_RESIZE`, `CAPS_LOADING`, `CAPS_ERROR`;
- `CAPS_PAYMENT_REDIRECT`, `CAPS_PAYMENT_REDIRECT_LOADING`, `CAPS_PAYMENT_REDIRECT_CANCEL`.

It SHALL also export their payload types. Every message SHALL carry `source: 'caps'` and `version: CAPS_PROTOCOL_VERSION`. The existing SDK `IframeMessageType` constants SHALL be re-exported from this module and keep their current string values.

#### Scenario: Backward compatible redirect message

- **WHEN** the server view `iframe-redirect.ejs` posts `{ type: 'CAPS_PAYMENT_REDIRECT', url }`
- **THEN** the SDK `useIframeMessageBridge` still handles it as a payment redirect

#### Scenario: Foreign messages are ignored

- **WHEN** a listener using the contract helper `isCapsMessage` receives a message without `source: 'caps'`
- **THEN** the helper returns `false` and the message is ignored
