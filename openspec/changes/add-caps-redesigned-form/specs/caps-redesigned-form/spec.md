## ADDED Requirements

### Requirement: Step-by-step form

The redesigned form SHALL display the payment flow one step at a time, in this order: payment schedule, payment method, then the remaining steps required by the issuer. The user SHALL only reach the next step when the fields of the current step are valid. The final submit SHALL use the same submit path as the legacy form.

#### Scenario: Next step with valid fields

- **WHEN** the user has chosen a payment schedule and activates the next-step control
- **THEN** the payment method step is displayed

#### Scenario: Next step with invalid fields

- **WHEN** a required field of the current step is empty and the user activates the next-step control
- **THEN** the form stays on the current step and shows the field error

### Requirement: Same form fields and schema

The redesigned form SHALL use the same react-hook-form fields (`amount`, `provider_id`, `payment_condition_id`, ...), the same `capsFormSchema` and the same BFF and Directus calls as the legacy form. The payload sent on submit SHALL be identical for the same user choices.

#### Scenario: Equivalent submit payload

- **WHEN** the same schedule, provider and contact choices are made in the legacy form and in the redesigned form
- **THEN** both submit the same payload to the BFF

### Requirement: Coexistence with the legacy UI

The SDK SHALL keep the current form components in `components/legacy/` and render them only when the embed prop `theme` is `'legacy'`. When `theme` is absent or `'current'`, the form at the root of `components/` SHALL be rendered.

#### Scenario: Legacy requested

- **WHEN** `RemoteCapsForm` receives `theme` set to `'legacy'`
- **THEN** it renders `LegacyFlow` and the current form is displayed unchanged

#### Scenario: Default UI

- **WHEN** `RemoteCapsForm` receives no `theme` prop
- **THEN** it renders the redesigned form

### Requirement: Required components per issuer

`validateComponents` SHALL accept either the legacy component set or the redesigned component set for each issuer, and SHALL fail when neither is complete.

#### Scenario: Incomplete redesigned set

- **WHEN** a redesigned flow omits a component required for the issuer
- **THEN** `validateComponents` reports the missing component

### Requirement: PSP integrations reused

The payment method step SHALL render the existing PSP integrations (hosted fields, redirect and BNPL options) through the existing registry, without per-PSP changes.

#### Scenario: Hosted fields provider

- **WHEN** the user selects a provider whose `display_type` is `hosted_field`
- **THEN** the payment method step renders the registered PSP form
