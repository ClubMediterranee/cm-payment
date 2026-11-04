## MODIFIED Requirements

### Requirement: Flow props type

The contract SHALL export a `CapsFormProps` type describing a CAPS flow. It contains:

- `issuerType` (`'GM' | 'GO' | 'PARTNERS'`), `type` (`'booking' | 'proposal'`), `id`, `callbackUrl` (required);
- `customerId` (required when `issuerType` is `'GO'` or `'PARTNERS'`);
- optional `locale`, `accessToken`, `callbackUrlSeller`, `action`, `reference`, `uuid`, `content`, `theme` (`'legacy' | 'current'`) and `stepper`;
- the environment selectors `env` and `url`;
- the callbacks `onEvent` and `onRedirect`;
- the presentation props `className`, `style` and `fallback`.

The issuer values SHALL be string literals equal to the SDK `OidcIssuerTypes` enum values, so the two are interchangeable.

#### Scenario: customerId is required for sellers

- **WHEN** a consumer renders a wrapper with `issuerType="GO"` and no `customerId`
- **THEN** TypeScript reports a type error

#### Scenario: GM flow without customerId

- **WHEN** a consumer renders a wrapper with `issuerType="GM"` and no `customerId`
- **THEN** the code type-checks

#### Scenario: theme is optional

- **WHEN** a consumer renders a wrapper without the `theme` prop
- **THEN** the code type-checks and the theme is resolved from the CMS

#### Scenario: Removed callbacks

- **WHEN** a consumer passes `onReady`, `onLoadingChange` or `onError` to a wrapper
- **THEN** TypeScript reports a type error

## ADDED Requirements

### Requirement: Tracking events

The contract SHALL export a `CapsEvent` type, a discriminated union on `action` and `name`, and `CapsFormProps` SHALL accept `onEvent?: (event: CapsEvent) => void`. The members are:

- `{ action: '', name: 'load' }` and `{ action: '', name: 'load_end' }`: the payment request starts and ends;
- `{ action: 'click', name: 'submit', data: { provider_id, amount, currency } }`: the user submitted a valid form. `amount` is a number, the amount actually paid for the selected schedule or BNPL option;
- `{ action: '', name: 'redirect', data: { url } }`: the flow is about to navigate to `url`;
- `{ action: '', name: 'error', data: { code, message } }`: `code` is a `CapsEmbedErrorCode`.

`onEvent` SHALL be fire-and-forget: its return value is ignored and an exception thrown by the host handler SHALL NOT interrupt the flow. No `data` SHALL contain card data, personal data or the raw response of a PSP.

#### Scenario: Narrowing on the event

- **WHEN** a host handler tests `event.action === 'click' && event.name === 'submit'`
- **THEN** TypeScript types `event.data` as `{ provider_id: string; amount: number; currency: string }`

#### Scenario: Submit on a valid form

- **WHEN** the user submits a valid form with provider `P1` for 1250 EUR
- **THEN** `onEvent` is called once with `{ action: 'click', name: 'submit', data: { provider_id: 'P1', amount: 1250, currency: 'EUR' } }` before the PSP request is sent

#### Scenario: Submit on an invalid form

- **WHEN** the user submits a form that fails validation
- **THEN** no `submit` event is emitted

#### Scenario: Token retry

- **WHEN** the payment request is replayed after a token refresh
- **THEN** no second `submit` event is emitted

#### Scenario: Host handler throws

- **WHEN** the `onEvent` handler of the host throws
- **THEN** the payment flow goes on as if it had returned

#### Scenario: Redirect event

- **WHEN** the flow navigates to a PSP or confirmation URL and `onRedirect` does not return `false`
- **THEN** `onEvent` is called with `{ action: '', name: 'redirect', data: { url } }` just before the navigation
