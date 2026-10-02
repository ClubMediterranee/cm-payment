# caps-webcomponent-embed Specification

## Purpose

The @clubmed/caps/webcomponent wrapper (CapsFormWebComponent): runtime loading of the CAPS form remote through Module Federation and the React bridge, rendered in a style-isolated shadow root.

## Requirements

### Requirement: Webcomponent sub-path export

`@clubmed/caps` SHALL expose the `./webcomponent` sub-path, which exports `CapsFormWebComponent` and re-exports the contract types. The entry SHALL be marked `'use client'`. It SHALL perform no DOM, `window` or network access at import time.

#### Scenario: Import in a server-rendered host

- **WHEN** a Next.js or other SSR host imports `@clubmed/caps/webcomponent` on the server
- **THEN** the import succeeds without touching `window` or `document`

#### Scenario: Next.js server render

- **WHEN** a Next.js App Router page renders `CapsFormWebComponent` inside a client component
- **THEN** the server HTML contains only `fallback`, and the remote is loaded after hydration with no hydration mismatch

#### Scenario: Supported host bundlers

- **WHEN** the wrapper is bundled by webpack 5, Vite or Next.js
- **THEN** the build does not try to resolve or bundle the remote URL, and the form loads at runtime

### Requirement: Runtime loading through Module Federation

`CapsFormWebComponent` SHALL load the remote `caps/CapsForm` from `<resolvedCapsUrl>/mfe/mf-manifest.json` using a private Module Federation runtime instance (`createInstance`). It SHALL NOT use the global federation instance. The instance and the loaded module SHALL be memoised per base URL, so that the manifest and remote entry are fetched once per page for a given URL.

#### Scenario: Two forms on the same page share one load

- **WHEN** a host renders two `CapsFormWebComponent` with the same `env`
- **THEN** `mf-manifest.json` and `remoteEntry.js` are each requested once

#### Scenario: Host already uses Module Federation

- **WHEN** the host application has its own Module Federation runtime and remotes
- **THEN** loading CAPS neither modifies nor reads the host's remotes and shared scope

### Requirement: Rendering through the Module Federation React bridge

The remote SHALL expose `caps/CapsForm` as a `createBridgeComponent` provider from `@module-federation/bridge-react` (React 19 entry), together with a named `protocolVersion` export. The wrapper SHALL render it with `createRemoteAppComponent` from `@module-federation/bridge-react/base`, into a host `<div>` that receives `className` and `style`. Nothing SHALL be shared between the host and the remote: React, React DOM, the SDK, trident-ui v1, trident-icons, react-query, react-hook-form and zod are bundled in the remote, which renders with its own React root. Hosts SHALL run React 18 or later.

#### Scenario: React 18 host in development mode

- **WHEN** the form is rendered in a React 18.3 host built in development mode
- **THEN** the form renders without any "Invalid hook call" error, and the host React is not used by the remote

#### Scenario: React 19 host

- **WHEN** the form is rendered in a Next.js host on its vendored React 19
- **THEN** the form renders with the remote React root

#### Scenario: Host without trident-ui

- **WHEN** the host has neither trident-ui nor Tailwind installed
- **THEN** the form renders with its full trident-ui v1 look

#### Scenario: Unsupported React version

- **WHEN** the host runs React 17 or older
- **THEN** the wrapper does not render the remote
- **AND** it calls `onError({ code: 'REACT_VERSION_UNSUPPORTED', message })` and renders nothing

### Requirement: Shadow DOM style isolation

The exposed `CapsForm` SHALL render a `<caps-form>` host element with an open shadow root, and render the flow into it through a React portal. All CAPS styles SHALL be injected into the shadow root (constructable stylesheets, falling back to a `<style>` element): the Tailwind v3 build, the trident-ui v1 CSS and the SDK styles. Stylesheet selectors targeting `:root`, `html` or `body` SHALL be rewritten to `:host`. `@font-face` rules SHALL be injected once in `document.head`. Components that portal overlays (modals, tooltips, loaders) SHALL use a container inside the shadow root.

#### Scenario: CAPS styles do not leak into the host

- **WHEN** the form is rendered in a host using Tailwind v4 and shadcn
- **THEN** the computed styles of host elements outside `<caps-form>` are identical before and after the form mounts

#### Scenario: Host styles do not leak into CAPS

- **WHEN** the host defines global rules for `button`, `h1`, `*` and Tailwind utilities
- **THEN** CAPS elements inside the shadow root are unaffected
- **AND** they only inherit the inherited properties that CAPS explicitly resets on `:host`

#### Scenario: Modal stays styled

- **WHEN** a CAPS component opens a modal (donation or overpayment confirmation)
- **THEN** the modal is rendered inside the shadow root with CAPS styles applied

### Requirement: Props and callbacks

`CapsFormWebComponent` SHALL forward `CapsFormProps` to the remote component as React props. Prop changes SHALL be applied without remounting the form. `accessToken` SHALL never be written to a DOM attribute. The callbacks behave as follows:

- `onReady` SHALL be called once the flow is interactive.
- `onLoadingChange` SHALL mirror the SDK `onLoad` / `onLoadEnd` callbacks.
- `onError` SHALL receive `{ code, message }`.
- `onRedirect(url)` SHALL be called before any top-level navigation. If it returns `false`, the default `window.location.assign(url)` SHALL be skipped.

#### Scenario: Token refresh

- **WHEN** the host re-renders the wrapper with a new `accessToken`
- **THEN** subsequent API calls use the new token and the form state is preserved

#### Scenario: Host handles navigation

- **WHEN** the flow needs to redirect to a PSP or confirmation URL and `onRedirect` returns `false`
- **THEN** CAPS does not navigate and the host is responsible for it

### Requirement: Loading and failure states

The wrapper SHALL render `fallback` while the remote loads. If loading fails (network error, invalid manifest, protocol version mismatch), it SHALL call `onError` with the code `REMOTE_LOAD_FAILED` or `PROTOCOL_MISMATCH`. It SHALL NOT throw into the host React tree.

#### Scenario: CAPS server unreachable

- **WHEN** `mf-manifest.json` cannot be fetched
- **THEN** `onError({ code: 'REMOTE_LOAD_FAILED' })` is called and the host keeps working

#### Scenario: Protocol mismatch

- **WHEN** the remote exposes a `protocolVersion` whose major differs from the wrapper's `CAPS_PROTOCOL_VERSION`
- **THEN** the wrapper calls `onError({ code: 'PROTOCOL_MISMATCH' })` and does not render the remote

### Requirement: Runtime configuration

The remote SHALL call the CAPS API and REST endpoints on the CAPS server origin, not on the host origin. It SHALL obtain its API key and any environment settings from `GET <capsUrl>/rest/embed/config`, not from build-time `VITE_*` variables.

#### Scenario: API calls target the CAPS origin

- **WHEN** the form is rendered on `https://host.example` with `env="staging"`
- **THEN** every `/api/*` and `/rest/*` request goes to `CAPS_ENV_URLS.staging`
