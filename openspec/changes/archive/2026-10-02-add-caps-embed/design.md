## Context

- **`packages/server` (Ts.ED 8, Fastify 5)** already:
  - serves `packages/app/dist` as a SPA on `/`, with a `/*` fallback to `index.html` (`Server.$staticsMounted`);
  - proxies `/api` to the Club Med API (`config/proxy`);
  - exposes REST controllers on `/rest`, including the PSP callback `/rest/payment_redirect/:id`.
- **`packages/app`** is a full-page SPA. It:
  - uses `wouter` routes on `window.location` (`/:issuer/:type/:id`, `/:issuer/confirmation`);
  - authenticates with `react-oidc-context` (full-page redirect, `localStorage` store);
  - builds its API URL from `window.location.origin`;
  - embeds API keys and OIDC client ids at build time (`VITE_*`);
  - ships global CSS (`index.css`, Tailwind preflight, `@clubmed/trident-ui/style.css`).
- **`packages/sdk` (`@clubmed/caps`)** is a React 19 library:
  - trident-ui v1 and trident-icons are peers, and Tailwind classes are compiled by the consumer;
  - config is held in a module-level singleton (`getPaymentConfig`);
  - it navigates with `window.location.href` (`IframeView`, `loadPaymentProviderUrl`);
  - it loads PSP scripts into `document.body` (`useScriptLoader`) and posts iframe messages to `'*'`.
- **Target hosts** are React apps:
  - "legacy" journeys without trident-ui;
  - journeys on trident-ui v2, whose components are copied locally with shadcn (probably Tailwind v4).
- **Constraints:** React 18 is the minimal host version, and Tailwind collisions are the main problem.

## Goals / Non-Goals

**Goals:**

- Two portable React wrappers, `@clubmed/caps/webcomponent` and `@clubmed/caps/iframe`, with the same `CapsFormProps` API and `env` / `url` selection. Neither imports anything from the SDK.
- Full CSS isolation in both directions, with no Tailwind configuration required in the host.
- CAPS UI updates ship by deploying the CAPS server, without republishing hosts (runtime loading).
- Webcomponent mode: the host owns authentication and provides the access token.
- Iframe mode: Club Med SSO works through the iframe (in-frame OIDC), and a host-provided token is an optional shortcut.
- Works in hosts bundled with webpack 5, Vite and Next.js (App Router and Pages Router).
- The standalone app behaviour is unchanged.

**Non-Goals:**

- Supporting non-React hosts (a framework-agnostic Custom Element can be added later on top of the remote).
- Supporting React < 18 hosts.
- Sharing any library with the host, React included (see D1).
- Migrating the SDK itself to trident-ui v2 or Tailwind v4.
- Removing OIDC from the standalone app.

## Decisions

### D1. Module Federation runtime and React bridge, driven by the wrapper

The wrapper creates a private instance with `createInstance` from `@module-federation/runtime` and calls `loadRemote('caps/CapsForm')`. The remote, built with `@module-federation/vite` in `packages/mfe`, exposes a `createBridgeComponent` provider (`@module-federation/bridge-react/v19`). The wrapper renders it with `createRemoteAppComponent` (`@module-federation/bridge-react/base`): the remote mounts its own React 19 root in a host DOM node. **Nothing is shared**, React included.

- _Why:_ React 18 is the minimal host version. Sharing React as a singleton (first implementation) made the remote, compiled for React 19, run on the host React 18; it worked in production builds but failed in React 18 development builds ("Invalid hook call", the `react-dom` module seen by the remote differed from the host one). The bridge removes any React version coupling: the host only provides a DOM node, and props and callbacks are passed to the remote root on each host render (no remount). A private instance avoids clashing with hosts that already use federation.
- _Cost:_ the remote downloads its own React and React DOM (about 60 kB gzip).
- _Alternatives:_
  - (a) React as a shared singleton (`loaded-first`). Rejected: fragile across React majors and bundler interop modes.
  - (b) An import map or a global React shim with a custom Rollup rewrite. This reinvents version negotiation and is fragile.
  - (c) A host-side MF bundler plugin. This is not portable across legacy bundlers.

### D2. The remote exposes a React component that owns its Shadow DOM

`caps/CapsForm` (the bridge root component) renders `<caps-form>`, attaches an open shadow root on mount, injects styles, then renders the flow with `createPortal` into the shadow root. Props and callbacks are plain JavaScript values passed through the bridge.

- _Why:_ Styles evolve with the remote, not with the npm wrapper, and the wrapper stays a thin loader. No `CustomEvent` or attribute serialisation is needed.
- _Alternative:_ A real Custom Element with its own `createRoot`. It is kept as a possible future addition for non-React hosts, but it is not needed now.

### D3. CSS strategy inside the shadow root

- The remote builds one CSS bundle: Tailwind v3 with the trident preset, `@clubmed/trident-ui/style.css` and SDK styles. It is imported with `?inline` and applied with `adoptedStyleSheets`, falling back to `<style>`.
- A PostCSS step rewrites `:root`, `html` and `body` selectors to `:host`.
- `@font-face` rules are extracted and injected once into `document.head`, because fonts declared in a shadow root are not reliably applied.
- `:host` resets the inherited properties (`font`, `color`, `line-height`, `letter-spacing`) and re-declares every CSS custom property CAPS relies on, so that host `:root` variables (shadcn `--primary`, `--radius`, …) cannot bleed in through inheritance.
- Overlays: there is no `createPortal` in `@clubmed/trident-ui@1.5.0`, the SDK or the app, so overlays render in place, inside the shadow root. The flow does have overlays, however (see D11), and their positioning is a separate problem.
- _Alternative:_ Light-DOM scoping (`preflight: false`, `important: 'caps-form'`, `postcss-prefix-selector`). It is kept as the fallback if the spike shows that PSP SDKs cannot work inside a shadow root (see R1).

### D4. Runtime configuration from the server

The remote and the embedded app fetch `GET /rest/embed/config`, which returns `apiUrl`, `apiKey`, `allowedOrigins` and `protocolVersion`. All `/api` and `/rest` calls use `apiUrl`, which is the CAPS origin.

- _Why:_ One remote build serves every environment, API keys are not baked into assets, and the key-selection rules (GM BE/CA, GO, PARTNERS) live in one place.
- _Alternative:_ The host passes `apiKey`. This is rejected because it pushes CAPS internals to every host.

### D5. Authentication per mode

- **Webcomponent mode:** the host owns authentication and passes `accessToken` as a prop. The remote never starts an OIDC flow, because it runs on the host origin and would need one redirect URI per host.
- **Iframe mode, SSO through the iframe (default):**
  - The embedded app keeps its OIDC client and runs `useAutoSignin` inside the frame.
  - The authorize redirect and the `/:issuer/signin_redirect` callback stay in the iframe on the CAPS origin, so no extra redirect URI is needed.
  - The Club Med IdPs tolerate being framed.
  - `return_url` (in the OIDC `state`) keeps `embedded` and `parent_origin`, so the frame comes back in embedded mode after sign-in.
- **Iframe mode, host-provided token (optional):**
  - If the host passes `accessToken`, the wrapper sends it with the `CAPS_READY` → `CAPS_INIT` handshake, never in the URL.
  - The app then uses it and skips the OIDC redirect.
  - The app waits a short handshake window before starting OIDC, so that a host token wins when it is provided.
- **In-frame SSO fallback (R9):** when in-frame sign-in cannot complete (third-party cookies blocked, so no IdP session is visible), the app falls back to `signinPopup`. If the popup is blocked, the app posts `CAPS_ERROR { code: 'AUTH_REQUIRED' }` so the host can react.

### D6. Iframe mode reuses the app with `?embedded=1`

There is no new build. The app reads `embedded` and `parent_origin` and validates `parent_origin` against `allowedOrigins`. It then:

- hides its chrome;
- reports height with `ResizeObserver`;
- forwards every top-level navigation as `CAPS_PAYMENT_REDIRECT` through a single `navigate()` helper that replaces the direct `window.location.href` writes in the SDK and the app. When not embedded, the helper keeps the current behaviour.

### D7. Shared contract lives in the SDK, guarded by lint and a build check

`packages/sdk/src/embed/shared` holds the types, `CAPS_ENV_URLS`, `resolveCapsUrl`, `buildCapsFlowUrl` and the protocol. The SDK's own `utils/iframe/constants.ts` and `utils/url/getPaymentUrl.ts` re-export or delegate to it, so the protocol has a single source of truth. An oxlint `no-restricted-imports` override on `src/embed/**` and a post-build script over `dist/embed/**` enforce the zero-dependency rule.

- The current Vite lib config already emits one entry per source file, so `dist/embed/webcomponent/index.js` and `dist/embed/iframe/index.js` exist without extra entries. Only `package.json#exports` changes.

### D8. Versioning

`CAPS_PROTOCOL_VERSION` is an integer:

- the remote exposes `protocolVersion`;
- the wrapper refuses a remote with a different major version (`PROTOCOL_MISMATCH`);
- iframe messages carry `version`.

Additive prop changes do not bump the version. Breaking contract changes bump it and are released as a major version of `@clubmed/caps`.

### D9. Server hosting details

- `statics['/mfe']` is declared before `'/'` without `isApp`, so no SPA fallback applies.
- Cache headers are set with a `setHeaders` hook: `no-cache` for `mf-manifest.json` and `remoteEntry.js`, `immutable` for hashed files.
- CORS and framing are handled by a small Fastify plugin (`src/config/embed/embedHttpPlugin.ts`), registered before the `/api` proxy with `skip-override` so that its hooks cover the proxy too. It answers preflights for allow-listed `webcomponent` origins (no credentials), replaces upstream `access-control-*` headers on `/api` responses, and sets `frame-ancestors` on the app HTML responses.
  - _Alternative:_ `@fastify/cors`. It is not used because it would not strip the upstream proxy CORS headers nor handle `frame-ancestors`, and the hooks are about 100 lines.
- `frame-ancestors` is added in the SPA handler of `$staticsMounted` and in an `onSend` hook for `/` statics.
- **Allow-list:** the host origins are administered in the CMS API. A new Directus collection, `caps_allowed_origins` (`origin`, `modes` = `webcomponent` / `iframe`, `status`), is tracked in **CMAB-4432**. The server reads the published entries through `DirectusClient` in an `AllowedOriginsRepository` cached with Ts.ED `@UseCache({ ttl: 300, refreshThreshold: 240 })` (in-memory `cache` configuration). A failed background refresh keeps the cached list until it expires. `CAPS_ALLOWED_ORIGINS` (env) is merged in for both modes, as bootstrap, for local dev and as a fallback. Both sources ship **empty**, and origins are added later, per environment.
  - _Alternative:_ the environment variable only. This is rejected because adding a host would need a redeploy. When it is empty:
  - CORS and cross-origin `/mfe` loading are disabled;
  - `frame-ancestors` is `'self'`;
  - embedded mode rejects every `parent_origin`.

### D10. Host bundler compatibility (webpack 5, Vite, Next.js)

- The wrappers ship as plain ESM with `'use client'` preserved (`rollup-preserve-directives` is already in the SDK build) and have no top-level side effects.
- The remote is never resolved by the host bundler. The MF runtime fetches `mf-manifest.json` and `remoteEntry.js` at runtime, so webpack and Vite do not try to bundle a URL `import()`. Any internal dynamic import carries both `/* webpackIgnore: true */` and `/* @vite-ignore */`.
- `@module-federation/runtime` is bundler-agnostic. In a webpack 5 host that already uses `ModuleFederationPlugin`, `createInstance` keeps CAPS isolated from the host's federation (D1).
- **Next.js:** the wrappers are client components. `CapsFormWebComponent` renders `fallback` on the server and loads the remote only after hydration, with no `window` access during render. The docs recommend `next/dynamic` with `ssr: false` as an optional extra.
- The spike (tasks 1.x) and the `packages/embed-playground` demos cover the three host types.

### D11. Overlays: decision deferred until the tests

The flow has three overlays:

- the SDK `Popin` (`fixed inset-0 z-[100]`), used by `Donation` and `OverpaymentConfirmationPopin`;
- the payment loading overlay (trident `Loader`);
- the Oney simulation popin (third-party script).

They are kept **as is** in this change. Their behaviour is observed during the spike and the integration tests (tasks 1.5 and 10.1): host stacking contexts and transforms in webcomponent mode, visibility in a tall auto-resized iframe, and Oney in both modes. A follow-up change will be opened if the tests show problems.

Candidate options, for reference:

- a native `<dialog>` with `showModal()` (top layer);
- viewport sync and a host backdrop in iframe mode;
- scroll-into-view before opening Oney.

## Spike findings (2026-09-30, `packages/embed-playground`)

Host used: Vite + React 19 + Tailwind v4 with hostile global styles (shadcn-like `:root` variables, `--color-sienna` collision, `html { font-size: 62.5% }`, global `button`/`h2` rules, `transform` on the container).

Confirmed:

- **React singleton**: the remote uses the host React (one `react@19.2.7` share, no React chunk downloaded from the remote).
- **Isolation in both directions**: inside `<caps-form>` the font is Inter at 16px and `--color-sienna` keeps the trident-ui value; the host button and body keep their own styles.
- **Cross-origin loading**: manifest, chunks, `/rest/embed/config` and `/api` preflights work with the allow-list (`http://localhost:4006`).
- **Iframe mode**: `CAPS_READY` → `CAPS_INIT`, `CAPS_RESIZE`, and `CAPS_ERROR` reach the host.

Fixed during the spike:

- Constructable stylesheets silently drop `@import`, and the Google Fonts URL contains `;`: web font imports are now extracted with a quote-aware pattern and injected in the document head.
- In the app, the embedded provider was under the root error boundary: a failing flow unmounted it and the host never received any message. It now wraps the error boundary, and boundary errors are posted as `FLOW_ERROR`.
- Fastify statics with `wildcard: false` only know the files present at startup: after rebuilding the remote locally, restart the server (production images are immutable).

Host bundlers (2026-10-02, `examples/`, installed from `packages/sdk/dist` like the npm tarball):

- **webpack 5** and **Next.js 16** (App Router, Turbopack and `--webpack` builds) build and load both wrappers. Next.js renders the fallback on the server and loads the form after hydration.
- The host bundle contains React and the MF runtime only (no trident-ui, react-query or Tailwind).
- **React minor skew is fine**: hosts on React 19.3.0 and on the Next.js vendored `19.3.0-canary` provide the singleton; the remote's own React 19.2.7 fallback is never loaded.
- Found and fixed: the published `package.json` exports pointed to `./dist/*` while the package is published from `dist/` (already broken in 1.0.0); a browser language without region (`fr`) produced an invalid `locale`, now `fr-FR`.

Still to validate (tasks 1.4–1.6): PSP integrations and overlays on a real booking or proposal, and SSO through the iframe on Chrome, Safari and Firefox. These need test accounts and flows on staging.

## Risks / Trade-offs

- **[R1] PSP SDKs inside the shadow root.** Cybersource Microform, HiPay hosted fields and PayPal look up containers with `document.getElementById` or `querySelector`, and inject into `document.body`.
  → Phase 0 spike per PSP. The mitigation is to render the PSP containers in light DOM through a `<slot>` (light-DOM children of `<caps-form>` with scoped styles). The last resort is light-DOM scoping for the whole form (D3 alternative).
- **[R2] Inherited CSS custom properties and Tailwind v4 `@property`.** Host `:root` variables inherit into the shadow tree. Tailwind v4 registers global `@property --tw-*` definitions that also apply inside shadow roots and may conflict with Tailwind v3 values.
  → Re-declare the CAPS variables on `:host`, and cover this in the spike with a Tailwind v4 + shadcn host. If a conflict is found, rename CAPS Tailwind variables with a PostCSS prefix.
- **[R3] React version skew.** Hosts run React 18 or 19 while the remote is built for React 19.
  → Nothing is shared (D1): the remote renders with its own React root. Validated with a React 18.3 webpack host (development and production builds) and a Next.js 16 host (vendored React 19).
- **[R4] Module-level SDK singletons** (`getPaymentConfig`, `QueryClient`).
  → One CAPS form per page is a documented constraint. The remote creates its own `QueryClient` per mount.
- **[R5] Cybersource `target_origins`** becomes the host origin in webcomponent mode.
  → Check with the PSP whether origins must be registered, and add host origins to the PSP configuration per environment.
- **[R6] Host CSP.** Hosts must allow the CAPS origin (`script-src`, `connect-src`, `frame-src`) and the PSP domains.
  → Documented in the integration guide with a copy-paste CSP snippet per environment.
- **[R7] Runtime loading means CAPS changes reach hosts without their release.**
  → Protocol versioning (D8), and a staging → production promotion of the `/mfe` bundle aligned with the server release.
- **[R8] Security of `postMessage`.** The current code uses `'*'`.
  → Strict origin and source checks both ways, and the token is only sent to the resolved CAPS origin.
- **[R9] SSO through the iframe.** The iframe is cross-site to the host, so browsers treat IdP cookies as third-party:
  - Safari ITP and Firefox block them;
  - Chrome is phasing them out or partitioning them.

  The authorize redirect may therefore not see the existing IdP session and ask the user to log in again. The `localStorage` OIDC store is also partitioned per top-level site.
  → The Club Med OIDC setup tolerates framing, but this is a point to monitor. Tasks 1.6 and 10.1 test SSO across Chrome, Safari and Firefox. The fallbacks are, in order: `signinPopup` (first-party context), then a host-provided `accessToken` through the handshake, then `CAPS_ERROR { code: 'AUTH_REQUIRED' }`. Evaluate `requestStorageAccess()` / FedCM if popups are not acceptable.

- **[R10] Overlay positioning in hosts and iframes.** Host stacking contexts and transforms break `fixed` overlays, and a tall auto-resized iframe can hide a centered modal outside the visible area. The Oney popin is third-party DOM.
  → Observed in the spike and the integration tests (D11). Fix scope is decided on the results, in a follow-up change if needed.

## Migration Plan

1. Ship the server changes (`/mfe`, CORS, `/rest/embed/config`, `frame-ancestors`) with `CAPS_ALLOWED_ORIGINS` empty. This has no behaviour change for the current app.
2. Ship `packages/mfe` in the Docker image and deploy to integration, then staging.
3. Publish `@clubmed/caps` with the `./webcomponent` and `./iframe` exports (minor release: the exports are additive, and the SDK behaviour is unchanged outside embedded mode).
4. Onboard a pilot host on staging by publishing its origin in `caps_allowed_origins` (CMS API) and adding it to the PSP configuration.
5. Rollback: archive the host origin in `caps_allowed_origins` (effective within the cache TTL), and redeploy the previous image to restore the previous `/mfe` bundle. The standalone app is unaffected.

## Open Questions

Resolved:

- **Environment origins:**
  - `production` → `https://caps.api.clubmed`
  - `staging` → `https://staging.caps.api.clubmed`
  - `integration` → `https://integration.caps.api.clubmed`
- **Hosts on React < 19** use the iframe mode.
- **Host bundlers:** webpack 5, Vite and Next.js (D10). webpack 4 is not supported.
- **Allow-list:** it is administered in Directus (`caps_allowed_origins`, CMAB-4432), with `CAPS_ALLOWED_ORIGINS` as a fallback, and filled later (D9).
- **SSO must work through the iframe**, and the Club Med OIDC tolerates framing (D5, R9).
- **Portals:** trident-ui v1 has no portal (D3).

Still open:

1. The CMAB-4432 delivery (the Directus collection in integration, staging and production) is a prerequisite for task 3.2. Until it is delivered, only `CAPS_ALLOWED_ORIGINS` is used.
