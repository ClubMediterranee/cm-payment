## 1. Spike and decision gate (design R1, R2, R9)

- [x] 1.1 Scaffold throw-away host apps under `.tmp/embed-hosts`: Vite + React 19 + Tailwind v4 + shadcn, webpack 5 + React 19 with plain CSS and no trident-ui ("legacy"), and Next.js (App Router) + React 19
- [x] 1.2 Prototype a minimal `packages/mfe` remote exposing `./CapsForm` with React as the only shared singleton, loaded from the hosts through `createInstance` + `loadRemote`, and verify a single React instance (hooks and `React.version` identity)
- [x] 1.3 Render the trident-ui v1 flow inside a shadow root with injected CSS, and verify isolation in both directions (computed styles snapshot, host `:root` variables, Tailwind v4 `@property`)
- [ ] 1.4 Validate each PSP integration inside the shadow root (Cybersource Microform, HiPay card, HiPay PayPal, redirect and form POST providers) and record the results
- [ ] 1.5 Validate the `@font-face` injection, and observe the overlays as they are (the SDK `Popin`, the loading overlay and the Oney popin) in a host with a sticky header and a transformed wrapper, and in a tall auto-resized iframe; record the findings for the D11 follow-up
- [ ] 1.6 Validate SSO through the iframe on Chrome, Safari and Firefox (an existing IdP session is reused in-frame, the `signinPopup` fallback works, and the `return_url` keeps embedded mode)
- [ ] 1.7 Record the outcome in `design.md` (Shadow DOM, light-DOM slot for PSP containers, or light-DOM scoping) and update the affected tasks
- [ ] 1.8 Uplift "pay monthly" offer in the shadow root: the Uplift SDK fills the `data-up-*` price markup of `UpliftOption` from the document. Render this block in the light DOM of the shadow host (portal + `<slot>`, same mechanism as `usePspMountPoint`), with inline layout styles (inherited styles stay on the slot parent), then validate with an Uplift test account (monthly price displayed, tooltip opens); if the SDK reads more than these attributes, instrument its DOM accesses
- [ ] 1.9 PSP registry (`definePspProvider`), if it has to be made more robust: register the remaining provider UIs through it instead of local registries (`UpliftForm` in `IframeView`, `OneyOption` / `UpliftOption` in `BnplOption`, with dedicated kinds such as `iframe` and `bnpl-option`), and resolve the PayPal button from the selected provider id instead of the hard-coded `HIPAY_PAYPAL` in `SubmitButton` (check first that the API returns `MHIPAYPP` for PayPal)

## 2. Shared embed contract (`packages/sdk/src/embed/shared`)

- [x] 2.1 Add `types.ts` with `CapsEnv`, `CapsFormProps` (discriminated on `issuerType` for `customerId`) and `CapsEmbedError`
- [x] 2.2 Add `env.ts` with `CAPS_ENV_URLS` (`production` → `https://caps.api.clubmed`, `staging` → `https://staging.caps.api.clubmed`, `integration` → `https://integration.caps.api.clubmed`) and `resolveCapsUrl` (default `production`), plus unit tests (explicit URL precedence, trailing slash, unknown env)
- [x] 2.3 Add `url.ts` with `buildCapsFlowUrl`, plus unit tests (booking, proposal, seller without `customerId`, no token in URL)
- [x] 2.4 Add `protocol.ts` with `CAPS_PROTOCOL_VERSION`, the message constants, payload types and `isCapsMessage`, plus unit tests
- [x] 2.5 Rebase `utils/iframe/constants.ts` on the contract protocol (`getPaymentUrl` keeps its legacy output), and keep the existing specs green
- [x] 2.6 Add an oxlint `overrides` entry with `no-restricted-imports` for `packages/sdk/src/embed/**` (only `react`, `react/jsx-runtime` and `@module-federation/runtime` for the webcomponent entry)
- [x] 2.7 Add `packages/sdk/scripts/check-embed-deps.ts`, which parses `dist/embed/**` and the chunks they import and fails on forbidden bare imports or CSS, and run it in `build`
- [x] 2.8 Forbid `createPortal(…, document.body)` in `packages/sdk/src/**` (oxlint rule if available, otherwise a grep check in `check-embed-deps`), so that overlays stay inside the shadow root

## 3. Ts.ED server (`packages/server`)

- [x] 3.1 Add the `CAPS_ALLOWED_ORIGINS` parsing to `config/utils` (comma-separated, trimmed, empty by default), and declare it empty in `.env` and docker-compose
- [x] 3.2 Add `DirectusClient.getAllowedOrigins()` (published `caps_allowed_origins`, fields `origin` and `modes`) an `AllowedOriginsRepository` cached with `@UseCache` (in-memory Ts.ED `cache` configuration) and an `AllowedOriginsService` (merge with the env var, env-only fallback and a warning when Directus fails, split by mode), plus specs (empty lists, iframe-only origin, Directus down)
- [x] 3.3 Register the `embedHttpPlugin` Fastify plugin (CORS hooks backed by `AllowedOriginsService` (webcomponent origins) on `/api`, `/rest` and `/mfe` (allowed headers per spec, no credentials), with specs for an allowed preflight and an unknown origin
- [x] 3.4 Add `statics['/mfe']` before `'/'` (no `isApp`), with cache headers (`no-cache` for the manifest and remote entry, `immutable` for hashed files) and a 404 on missing assets, plus specs
- [x] 3.5 Add `EmbedConfigController` (`GET /rest/embed/config`), with API key resolution moved from `packages/app/src/hooks/useAppParams.ts` rules to server env vars (`CAPS_API_KEY_GM_BE`, `CAPS_API_KEY_GM_CA`, `CAPS_API_KEY_GO`, `CAPS_API_KEY_PARTNERS`), plus specs (GM booking, GM proposal, GO, PARTNERS, 400)
- [x] 3.6 Add `Content-Security-Policy: frame-ancestors 'self' <iframe origins>` on the `/` SPA responses (fallback handler and statics), plus specs
- [x] 3.7 Fail fast with an explicit log when the `/mfe` root is missing in production
- [ ] 3.8 Once CMAB-4432 is delivered: run `generate:directus` and drop the `caps_allowed_origins` cast in `DirectusClient.getAllowedOrigins()`

## 4. Module Federation remote (`packages/mfe`)

- [x] 4.1 Create the `@clubmed/caps-mfe` private package (package.json, tsconfig, Vite config with `@module-federation/vite`: `name: 'caps'`, `exposes: { './CapsForm' }`, `shared` limited to `react`, `react-dom`, `react/jsx-runtime` and `react-dom/client` as singleton `^19`, `manifest: true`)
- [x] 4.2 Add the Tailwind v3 + trident preset config and the CSS entry (trident-ui style, SDK styles), the PostCSS `:root`/`html`/`body` → `:host` rewrite and the `@font-face` extraction
- [x] 4.3 Implement `ShadowHost` (`<caps-form>` element, open shadow root, `adoptedStyleSheets` with a `<style>` fallback, `:host` resets and variable re-declaration, portal container context, one-time font injection in `document.head`)
- [x] 4.4 Implement the runtime config loader (`/rest/embed/config`) and the per-mount `QueryClient`, and wire `PaymentConfigProvider` with `api.url = capsUrl`
- [x] 4.5 Implement `CapsFlow`, composing the SDK flow components as in `packages/app/src/pages/PaymentPage.tsx`, and map `onLoad`/`onLoadEnd`/`onError` to `onLoadingChange`/`onError`/`onReady`
- [x] 4.6 Implement the `navigate()` override so that SDK redirects go through `onRedirect` (`false` cancels), then `window.location.assign`
- [x] 4.7 Export `CapsForm` with the static `protocolVersion`, and add Vitest browser tests (props update without remount, token refresh, style isolation, redirect cancel)
- [x] 4.8 Wire `pnpm dev:mfe` and the root `build` / `generate:types` scripts

## 5. SDK redirect abstraction (shared by the remote and the iframe mode)

- [x] 5.1 Introduce a `navigate(url, { method, fields })` helper with an overridable implementation (context or module setter) in the SDK
- [x] 5.2 Replace the direct `window.location.href` writes in `components/PaymentWidget/IframeView.tsx` and `utils/loadPaymentProviderUrl.ts` with `navigate()`, keeping the current standalone behaviour and the existing specs green
- [x] 5.3 Make `sendIframeMessage` target an explicit origin, and update `packages/server/views/iframe-redirect.ejs` to post to the CAPS origin instead of `'*'`

## 6. `@clubmed/caps/webcomponent`

- [x] 6.1 Add `@module-federation/runtime` to the SDK dependencies
- [x] 6.2 Implement `src/embed/webcomponent/loader.ts`: a `createInstance` memoised per base URL, the host React/ReactDOM shared registration, `loadRemote('caps/CapsForm')`, the React version check and the protocol check
- [x] 6.3 Implement `CapsFormWebComponent` (`'use client'`, `React.lazy` + `Suspense` with `fallback`, an internal error boundary mapping to `onError` codes `REMOTE_LOAD_FAILED` / `PROTOCOL_MISMATCH` / `REACT_VERSION_UNSUPPORTED`, and prop forwarding)
- [x] 6.4 Add `"./webcomponent"` to `packages/sdk/package.json#exports` (types and import), and verify the published `dist` layout (the `package.json` copied into `dist`)
- [x] 6.5 Unit tests: SSR-safe import, a single manifest fetch for two instances, error codes, and callbacks forwarded

## 7. Iframe mode

- [x] 7.1 App: parse `embedded` and `parent_origin`, validate them against `/rest/embed/config` `allowedOrigins`, and expose an `EmbeddedContext`
- [x] 7.2 App: in embedded mode, hide `Header`, `Footer` and the breadcrumb, use a transparent background and override the `index.css` body layout
- [x] 7.3 App: implement the handshake (`CAPS_READY` → `CAPS_INIT`), feed the optional `accessToken` and `content` into `AppProvider`, and skip OIDC when a host token is received
- [x] 7.4 App: SSO through the iframe. After the handshake window, run `useAutoSignin` in-frame with a `return_url` preserving `embedded` and `parent_origin`, fall back to `signinPopup` when in-frame sign-in fails, then post `CAPS_ERROR { code: 'AUTH_REQUIRED' }` with a sign-in call to action
- [x] 7.5 App: `ResizeObserver` → `CAPS_RESIZE`, loading → `CAPS_LOADING`, errors → `CAPS_ERROR`
- [x] 7.6 App: install the `navigate()` override that forwards to the parent as `CAPS_PAYMENT_REDIRECT` (GET and POST form variants), including the confirmation redirect
- [x] 7.7 SDK: implement `src/embed/iframe/CapsFormIFrame.tsx` (`'use client'`, `src` built with `buildCapsFlowUrl` + `embedded` + `parent_origin`, `allow="payment"`, `title`, origin and source checks, `CAPS_INIT` on ready and on token change, auto-height unless `height` is set, redirect handling with POST form submission, and callback mapping)
- [x] 7.8 Add `"./iframe"` to `packages/sdk/package.json#exports`
- [x] 7.9 Tests: the wrapper (foreign messages ignored, token never in `src`, resize, redirect cancel) and the app embedded mode (no chrome, no OIDC redirect when a host token is provided, in-frame sign-in and popup fallback, `AUTH_REQUIRED`, messages only to `parent_origin`)

## 8. Packaging and CI

- [x] 8.1 Dockerfile: copy `packages/mfe/package.json` in the builder, build `@clubmed/caps-mfe`, and copy `packages/mfe/dist` into the runtime image; point `statics['/mfe']` at it
- [x] 8.2 `.gitlab-ci.yml`: build and test `packages/mfe`, and run `check-embed-deps` in the SDK job (covered by `pnpm -r run build`, the SDK `build` script and the root Vitest projects)
- [x] 8.3 docker-compose: add the `CAPS_ALLOWED_ORIGINS` and API key env vars

## 9. Demos and documentation

- [x] 9.1 Create the private `packages/embed-playground` package (Vite + React 19 + Tailwind v4, shadcn-like styles) with `/webcomponent` and `/iframe` demo routes using both wrappers, with a Tailwind + shadcn-like host style to prove the isolation
- [x] 9.2 Add minimal webpack 5 and Next.js host examples (`examples/` projects) that build in CI
- [x] 9.3 Storybook stories for `CapsFormWebComponent` and `CapsFormIFrame` (pointing to `url` from an env var)
- [x] 9.4 Integration guide in `packages/sdk/docs/embed.md`, linked from the README and published as a Storybook MDX page, covering install, props, `env` / `url`, auth responsibilities, host CSP snippet (CAPS origin and PSP domains), one-form-per-page constraint, React `^19` requirement and iframe fallback
- [x] 9.5 Update the `packages/sdk/README.md` sub-path exports section

## 10. Verification

- [ ] 10.1 End-to-end on staging with the pilot host: GM booking, GO proposal with a seller callback, a redirect PSP, Cybersource and HiPay, in both modes, plus SSO through the iframe on Chrome, Safari and Firefox, and the overlay behaviour (donation popin, overpayment confirmation, loading, Oney) to decide on D11
- [ ] 10.2 Run `pnpm lint` (oxlint), `pnpm fmt:check`, `pnpm test --coverage`, `pnpm build` and `openspec validate add-caps-embed --strict`
