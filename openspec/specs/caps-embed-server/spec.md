# caps-embed-server Specification

## Purpose

Server side of the CAPS embed: hosting of the Module Federation remote under /mfe, CORS from the allowed host origins, and the embed configuration endpoint.

## Requirements

### Requirement: Remote hosting under /mfe

The Ts.ED server SHALL serve `packages/mfe/dist` under `/mfe`. This static mount SHALL be registered before the `/` SPA mount, and SHALL NOT use the SPA `index.html` fallback. A missing asset under `/mfe` SHALL return 404. Responses under `/mfe` SHALL include `Access-Control-Allow-Origin` for allow-listed origins. `mf-manifest.json` and `remoteEntry.js` SHALL be served with `Cache-Control: no-cache`. Content-hashed chunks SHALL be served with `Cache-Control: public, max-age=31536000, immutable`.

#### Scenario: Manifest fetched cross-origin

- **WHEN** `https://host.example` (allow-listed) fetches `/mfe/mf-manifest.json`
- **THEN** the response is 200 with `Access-Control-Allow-Origin: https://host.example` and `Cache-Control: no-cache`

#### Scenario: Missing chunk

- **WHEN** `/mfe/assets/unknown-abc123.js` is requested
- **THEN** the server responds 404 and does not return the app `index.html`

### Requirement: Allow-list source

The server SHALL build the embed allow-list from two sources:

- the published entries of the Directus collection `caps_allowed_origins` (field `origin`), read through `DirectusClient` (schema evolution tracked in CMAB-4432);
- the `CAPS_ALLOWED_ORIGINS` environment variable (comma-separated), which serves as bootstrap and fallback.

The Directus result SHALL be cached with the Ts.ED `@UseCache()` decorator (in-memory `cache` configuration, TTL of 300 seconds with a background refresh after 60 seconds); no custom cache implementation is allowed. While Directus is unavailable, the cached list SHALL be kept until it expires; after that, the server SHALL use `CAPS_ALLOWED_ORIGINS` only and SHALL log a warning. The allow-listed origins feed CORS.

#### Scenario: Origin published in the CMS

- **WHEN** a contributor publishes `https://seller.example` in `caps_allowed_origins`
- **THEN** within the cache TTL, preflights from `https://seller.example` receive CORS headers without a CAPS redeploy

#### Scenario: Directus unavailable

- **WHEN** Directus cannot be reached while refreshing the allow-list
- **THEN** the server keeps using the cached list until it expires, then `CAPS_ALLOWED_ORIGINS` only, and logs a warning

### Requirement: CORS allow-list for API and REST

The server SHALL enable CORS on `/api/*`, `/rest/*` and `/mfe/*` for the `webcomponent` origins of the allow-list (see "Allow-list source"). The allowed request headers SHALL include `content-type`, `authorization`, `x-api-key`, `x-issuer-type`, `accept-language` and `x-request-id`. Credentials SHALL NOT be allowed. Requests from non-listed origins SHALL receive no CORS headers.

#### Scenario: Preflight from an allowed host

- **WHEN** an allow-listed origin sends `OPTIONS /api/v1/payments` with `Access-Control-Request-Headers: authorization,x-api-key,x-issuer-type`
- **THEN** the server answers 204 with matching `Access-Control-Allow-*` headers

#### Scenario: Unknown origin

- **WHEN** a non-listed origin sends a preflight
- **THEN** the response carries no `Access-Control-Allow-Origin` header

#### Scenario: Allow-list not configured yet

- **WHEN** `CAPS_ALLOWED_ORIGINS` is unset or empty and `caps_allowed_origins` has no published entry
- **THEN** the server starts normally, no CORS header is sent for any origin, and the standalone app works as before

### Requirement: Runtime embed configuration endpoint

The server SHALL expose `GET /rest/embed/config?issuer=<GM|GO|PARTNERS>&type=<booking|proposal>`. It returns:

- `apiUrl`, the public origin of the CAPS server;
- `apiKey`, resolved with the same rules as the app: GM booking → CA key, GM proposal → BE key, GO → GO key, PARTNERS → PARTNERS key;
- `allowedOrigins`;
- `protocolVersion`.

Keys SHALL come from server environment variables. Invalid parameters SHALL return 400.

#### Scenario: GM booking key

- **WHEN** `GET /rest/embed/config?issuer=GM&type=booking` is called
- **THEN** the response contains the GM CA API key

#### Scenario: Invalid issuer

- **WHEN** `GET /rest/embed/config?issuer=FOO&type=booking` is called
- **THEN** the server responds 400

### Requirement: Packaging

The Docker image SHALL build `packages/mfe` and copy `packages/mfe/dist` next to `packages/app/dist`. The server SHALL fail fast at startup with an explicit log if the `/mfe` root directory is missing in production.

#### Scenario: Image contains the remote

- **WHEN** the production image is built and started
- **THEN** `GET /mfe/mf-manifest.json` returns 200
