## Why

Club Med booking journeys (legacy ones and those built on trident-ui v2, whose components are copied locally with shadcn) need to embed the CAPS payment flow. Today the only options are to install `@clubmed/caps` and wire up Tailwind, trident-ui v1 and the SDK providers in the host, or to redirect to the standalone app. The SDK assumes that trident-ui v1 and a compatible Tailwind setup exist in the host, and its global CSS (preflight, `trident-ui/style.css`) collides with the host's styles. We need a portable, versioned-at-runtime way to embed the CAPS flow. The host only provides a React 18+ application and a DOM node.

## What Changes

- Add a **zero-dependency embed contract** in `@clubmed/caps` (`src/embed/shared`): flow props type, environment → URL resolution, flow URL builder and a versioned `postMessage` protocol. The existing `getPaymentUrl` and `IframeMessageType` are rebased on it.
- Add the **`@clubmed/caps/webcomponent`** sub-path export with `<CapsFormWebComponent {...props} env="production" />`. It is a React loader that:
  - pulls the CAPS form at runtime from the CAPS server through Module Federation (`@module-federation/runtime`);
  - renders the remote through `@module-federation/bridge-react` (the remote has its own React root, nothing is shared with the host);
  - imports nothing from the SDK.
- Add a new private workspace package **`packages/mfe`** (Module Federation remote `caps`, exposes `./CapsForm`). It bundles the SDK, trident-ui v1, trident-icons, Tailwind v3 CSS and react-query, and renders the flow inside a **Shadow DOM** so that no CSS leaks in either direction.
- Add the **`@clubmed/caps/iframe`** sub-path export with `<CapsFormIFrame {...props} env="production" />`. It is a portable React iframe wrapper with:
  - a token handshake;
  - auto-resize;
  - top-level redirect forwarding;
  - strict origin checks.
- Add an **embedded mode** to `packages/app` (`?embedded=1`):
  - no header or footer;
  - Club Med SSO keeps working inside the iframe (in-frame OIDC, with a popup fallback), and an optional host-provided token is received through the handshake;
  - top-level navigations are forwarded to the parent;
  - `postMessage` targets explicit origins instead of `'*'`.
- Extend the **Ts.ED server** (`packages/server`):
  - serve the remote under `/mfe` (CORS, cache policy, mounted before the SPA fallback);
  - enable CORS on `/api` and `/rest` for allow-listed host origins. The allow-list is administered in the CMS API (new Directus collection `caps_allowed_origins`, CMAB-4432), with `CAPS_ALLOWED_ORIGINS` as a fallback;
  - add a runtime `GET /rest/embed/config` endpoint (API key resolution);
  - send a `frame-ancestors` CSP on the app.
- Update the Dockerfile and CI to build and ship `packages/mfe`, and add docs and a demo playground (`packages/embed-playground`) for both integration modes.

## Capabilities

### New Capabilities

- `caps-embed-contract`: The shared, dependency-free contract used by both wrappers and the embedded flow:
  - props;
  - environment URL resolution;
  - flow URL building;
  - message protocol and protocol versioning.
- `caps-webcomponent-embed`: The `@clubmed/caps/webcomponent` wrapper and the Module Federation remote `CapsForm` it loads. This covers React singleton sharing, Shadow DOM style isolation, loading and error states, and callbacks.
- `caps-iframe-embed`: The `@clubmed/caps/iframe` wrapper and the embedded mode of the CAPS app. This covers the handshake, resize, redirect forwarding and origin checks.
- `caps-embed-server`: The Ts.ED server responsibilities for embedding:
  - `/mfe` hosting;
  - CORS allow-list;
  - runtime embed config;
  - `frame-ancestors` policy.

### Modified Capabilities

None. `openspec/specs/` is empty, so there are no existing specs.

## Impact

- **`packages/sdk`**:
  - new `src/embed/**`;
  - new `exports` entries `./webcomponent` and `./iframe`;
  - new dependency `@module-federation/runtime`, used only by the webcomponent entry;
  - `utils/iframe/*` and `utils/url/getPaymentUrl.ts` rebased on the shared contract;
  - oxlint restriction on `src/embed/**`.
- **New `packages/mfe`**: Vite + `@module-federation/vite` build (`mf-manifest.json`, `remoteEntry.js`, hashed chunks).
- **`packages/app`**:
  - embedded mode in `Router`, `useAutoSignin`, `useAppParams` and the redirect helpers;
  - SDK redirect points (`IframeView`, `loadPaymentProviderUrl`) forward the navigation when embedded.
- **`packages/server`**:
  - `config.ts` (statics `/mfe`, plugin `@fastify/cors`);
  - new `EmbedConfigController`;
  - CSP header on the app statics;
  - new env vars `CAPS_ALLOWED_ORIGINS` and the per-issuer API keys.
- **Infra**: Dockerfile (build and copy of `packages/mfe/dist`), `.gitlab-ci.yml`.
- **External**:
  - PSP configuration: Cybersource `target_origins` must accept host origins;
  - host CSP must allow the CAPS origin and the PSP domains.
- **Consumers**:
  - hosts must run React 18 or later;
  - hosts on older React versions use the iframe mode.
