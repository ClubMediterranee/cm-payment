## MODIFIED Requirements

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
- **AND** it calls `onEvent({ action: '', name: 'error', data: { code: 'REACT_VERSION_UNSUPPORTED', message } })` and renders nothing

### Requirement: Props and callbacks

`CapsFormWebComponent` SHALL forward `CapsFormProps` to the remote component as React props. Prop changes SHALL be applied without remounting the form. `accessToken` SHALL never be written to a DOM attribute. The callbacks behave as follows:

- `onEvent` SHALL receive every `CapsEvent` emitted by the remote, in order, and the `error` events of the wrapper itself.
- `onRedirect(url)` SHALL be called before any top-level navigation. If it returns `false`, the default `window.location.assign(url)` SHALL be skipped and no `redirect` event SHALL be emitted.

#### Scenario: Token refresh

- **WHEN** the host re-renders the wrapper with a new `accessToken`
- **THEN** subsequent API calls use the new token and the form state is preserved

#### Scenario: Host handles navigation

- **WHEN** the flow needs to redirect to a PSP or confirmation URL and `onRedirect` returns `false`
- **THEN** CAPS does not navigate, emits no `redirect` event, and the host is responsible for the navigation

#### Scenario: New handler without remount

- **WHEN** the host re-renders the wrapper with a new `onEvent` function
- **THEN** the form is not remounted and the next event goes to the new function

#### Scenario: Events cross the shadow root

- **WHEN** the user clicks the submit button of a form rendered in the shadow root
- **THEN** the host `onEvent` receives the `submit` event

### Requirement: Loading and failure states

The wrapper SHALL render `fallback` while the remote loads. If loading fails (network error, invalid manifest, protocol version mismatch), it SHALL call `onEvent` with an `error` event whose code is `REMOTE_LOAD_FAILED` or `PROTOCOL_MISMATCH`. It SHALL NOT throw into the host React tree.

#### Scenario: CAPS server unreachable

- **WHEN** `mf-manifest.json` cannot be fetched
- **THEN** `onEvent` is called with an `error` event with the code `REMOTE_LOAD_FAILED` and the host keeps working

#### Scenario: Protocol mismatch

- **WHEN** the remote exposes a `protocolVersion` whose major differs from the wrapper's `CAPS_PROTOCOL_VERSION`
- **THEN** the wrapper calls `onEvent` with an `error` event with the code `PROTOCOL_MISMATCH` and does not render the remote
