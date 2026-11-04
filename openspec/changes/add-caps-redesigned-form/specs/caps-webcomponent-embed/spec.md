## ADDED Requirements

### Requirement: UI variant selection

The webcomponent wrapper SHALL forward the `theme` prop to the remote `CapsForm`. The remote SHALL render the form of that theme and, when the prop is absent, the form of the theme resolved from the CMS (`'legacy'` by default). The prop SHALL NOT change the protocol major version.

#### Scenario: Prop forwarded to the remote

- **WHEN** a host renders `<CapsFormWebComponent theme="legacy" />`
- **THEN** the remote receives `theme` set to `'legacy'` and renders the current form

#### Scenario: No prop

- **WHEN** a host renders `<CapsFormWebComponent />` without `theme`
- **THEN** the remote renders the form of the theme set in the CMS, or the current form when none is set
