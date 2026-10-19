## ADDED Requirements

### Requirement: Cascading payment flow

The redesigned form SHALL display the payment schedule as cards, then the payment methods as a list of cards. Only the selected payment method SHALL be expanded, and its panel SHALL contain everything needed to pay: the billing address, the PSP widget, the general terms and conditions and the submit button, in the order required by the provider's display type. The final submit SHALL use the same submit path as the legacy form.

#### Scenario: Provider selected

- **WHEN** the user selects a payment method
- **THEN** that method's card expands with its panel and the other methods stay collapsed

#### Scenario: Redirect provider

- **WHEN** the selected provider's `display_type` is `redirect`
- **THEN** its panel shows the general terms and conditions and a submit button, without billing address or card fields

#### Scenario: Buy now pay later

- **WHEN** the user selects a buy-now-pay-later schedule card
- **THEN** the payment method list is hidden and the general terms and conditions and the PSP widget are displayed

#### Scenario: Invalid fields

- **WHEN** a required field of the panel is empty and the user submits
- **THEN** the form shows the field errors and does not call the BFF

### Requirement: Same form fields and schema

The redesigned form SHALL use the same react-hook-form fields (`amount`, `provider_id`, `payment_condition_id`, ...), the same `capsFormSchema` and the same BFF and Directus calls as the legacy form. The payload sent on submit SHALL be identical for the same user choices.

#### Scenario: Equivalent submit payload

- **WHEN** the same schedule, provider and contact choices are made in the legacy form and in the redesigned form
- **THEN** both submit the same payload to the BFF

### Requirement: Coexistence with the legacy UI

The SDK SHALL keep the current form components in `components/legacy/` and render them when the resolved theme is `'legacy'`. The resolved theme SHALL be the embed prop `theme` when given, otherwise the `theme` setting returned by `GET /rest/payment_config`, otherwise `'legacy'`. When the resolved theme is `'current'`, the form at the root of `components/` SHALL be rendered.

#### Scenario: Legacy requested

- **WHEN** `RemoteCapsForm` receives `theme` set to `'legacy'`
- **THEN** it renders `LegacyFlow` and the current form is displayed unchanged

#### Scenario: Theme from the CMS

- **WHEN** `RemoteCapsForm` receives no `theme` prop and `GET /rest/payment_config` returns `settings.theme` set to `'current'`
- **THEN** it renders the redesigned form

#### Scenario: Prop overrides the CMS

- **WHEN** `RemoteCapsForm` receives `theme` set to `'legacy'` and the CMS theme is `'current'`
- **THEN** it renders `LegacyFlow` and does not wait for the payment configuration to choose the flow

#### Scenario: No theme anywhere

- **WHEN** `RemoteCapsForm` receives no `theme` prop and the payment configuration has no `theme`
- **THEN** it renders `LegacyFlow`

### Requirement: Theme setting in the payment configuration

`GET /rest/payment_config` SHALL return the `theme` key of `caps_configurations` in `settings.theme`, resolved with the locale and issuer overrides. A value other than `'legacy'` or `'current'` SHALL be omitted.

#### Scenario: Value with a locale override

- **WHEN** the `theme` key is `'legacy'` by default with an override `'current'` for the requested locale and issuer
- **THEN** `settings.theme` is `'current'`

#### Scenario: Invalid value

- **WHEN** the `theme` key holds a value that is neither `'legacy'` nor `'current'`
- **THEN** `settings` has no `theme`

### Requirement: Required components per issuer

`validateComponents` SHALL accept either the legacy component set or the redesigned component set for each issuer, and SHALL fail when neither is complete.

#### Scenario: Incomplete redesigned set

- **WHEN** a redesigned flow omits a component required for the issuer
- **THEN** `validateComponents` reports the missing component

### Requirement: PSP integrations reused

The payment method panel SHALL render the existing PSP integrations (hosted fields, redirect and BNPL options) through the existing registry, without per-PSP changes.

#### Scenario: Hosted fields provider

- **WHEN** the user selects a provider whose `display_type` is `hosted_field`
- **THEN** the panel renders the registered PSP form

### Requirement: Stepper mode

When the embed prop `stepper` is true and `theme` is `'current'`, the redesigned form SHALL reveal its sections in order: the payment schedule when the user has a choice, then the payment methods, then the details of the selected method, and finally the submit button. The submit button SHALL be displayed only while the form is valid.

#### Scenario: Schedule first

- **WHEN** the form loads in stepper mode and several payment schedules are available
- **THEN** only the schedule cards are displayed and none is selected

#### Scenario: Payment methods after the schedule

- **WHEN** the user selects a schedule
- **THEN** the payment methods are displayed, none selected when several exist

#### Scenario: Details after the payment method

- **WHEN** the user selects a payment method
- **THEN** its panel, the contact choice, the comments and the donation are displayed, without the submit button

#### Scenario: Submit button follows validity

- **WHEN** every field is valid
- **THEN** the submit button is displayed
- **AND WHEN** a field becomes invalid
- **THEN** the submit button is hidden
