## MODIFIED Requirements

### Requirement: Flow props type

The contract SHALL export a `CapsFormProps` type describing a CAPS flow. It contains:

- `issuerType` (`'GM' | 'GO' | 'PARTNERS'`), `type` (`'booking' | 'proposal'`), `id`, `callbackUrl` (required);
- `customerId` (required when `issuerType` is `'GO'` or `'PARTNERS'`);
- optional `locale`, `accessToken`, `callbackUrlSeller`, `action`, `reference`, `uuid`, `content` and `theme` (`'legacy' | 'current'`);
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

#### Scenario: theme is optional

- **WHEN** a consumer renders a wrapper without the `theme` prop
- **THEN** the code type-checks and the theme is resolved from the CMS
