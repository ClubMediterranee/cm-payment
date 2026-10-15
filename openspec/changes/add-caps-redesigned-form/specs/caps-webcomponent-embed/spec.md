## ADDED Requirements

### Requirement: UI variant selection

The webcomponent wrapper SHALL forward the `theme` prop to the remote `CapsForm`. The remote SHALL render the current form when `theme` is `'legacy'` and the redesigned form otherwise. The prop SHALL NOT change the protocol major version.

#### Scenario: Prop forwarded to the remote

- **WHEN** a host renders `<CapsFormWebComponent theme="legacy" />`
- **THEN** the remote receives `theme` set to `'legacy'` and renders the current form

#### Scenario: No prop

- **WHEN** a host renders `<CapsFormWebComponent />` without `theme`
- **THEN** the remote renders the redesigned form
