<div style="text-align: center" align="center">
 <img src="https://ns.clubmed.com/fbs/RWD/branding2023/Logo/MicrosoftTeams-image%20(9).png" width="200" alt="Club Med"/>
</div>

<div align="center">
   <h1>@clubmed/caps</h1>

[![npm version](https://badge.fury.io/js/%40clubmed%2Fcaps.svg)](https://www.npmjs.com/package/@clubmed/caps)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

</div>

## Overview

`@clubmed/caps` is the embedded React SDK for the Club Med payment experience. It lets you compose a payment form directly in a React application, while CAPS manages payment data loading, validation, submission, and payment-provider handoff.

CAPS also offers a hosted Redirect Mode for non-React or lower-effort integrations. This package is for the embedded React SDK mode.

## Prerequisites

- React and React DOM `^19.2.0`
- `@clubmed/trident-ui` `1.5.0` (migration to v2 is planed).
- `@clubmed/trident-icons` `>=1.3.3`
- CAPS API URL, API key, and OIDC access token supplied by Club Med

## Installation

```sh
npm install @clubmed/caps @clubmed/trident-ui @clubmed/trident-icons
```

`@tanstack/react-query` and `react-hook-form` are installed as package dependencies.

## Configure the SDK

Wrap the payment area with `PaymentConfigProvider`. Provide exactly one payment context: `proposalId` or `bookingId`.

```tsx
import { OidcIssuerTypes, PaymentConfigProvider } from '@clubmed/caps';

function Checkout() {
  return (
    <PaymentConfigProvider
      locale="fr-FR"
      proposalId="12345"
      customerId="67890"
      callbackUrl="https://your-app.com/payment/confirmation"
      oidc={{
        issuerType: OidcIssuerTypes.GM,
        accessToken: 'YOUR_ACCESS_TOKEN',
      }}
      api={{
        url: 'YOUR_CAPS_API_URL',
        apiKey: 'YOUR_CAPS_API_KEY',
      }}
    >
      {/* Payment form */}
    </PaymentConfigProvider>
  );
}
```

`PaymentConfigProvider` initializes CAPS data fetching. The `callbackUrl` must be a route in your application that can receive the user after the payment flow completes.

## Build the payment form

Place the payment components inside `Form`. CAPS validates the composition according to the configured OIDC issuer. The example below is the required GM composition.

```tsx
import {
  BillingAddress,
  CardInstallments,
  Cgv,
  Donation,
  Form,
  PaymentProviders,
  PaymentSchedule,
  PaymentWidget,
  SubmitButton,
} from '@clubmed/caps';

function PaymentForm() {
  return (
    <Form onError={console.error}>
      <PaymentSchedule />
      <PaymentProviders />
      <CardInstallments />
      <Donation />
      <Cgv />
      <BillingAddress />
      <PaymentWidget />
      <SubmitButton>Pay now</SubmitButton>
    </Form>
  );
}
```

For `GO` and `PARTNERS` issuers, `ContactChoice` is required instead of `PaymentWidget`. Required components are checked at runtime; CAPS throws an error when the composition is incomplete.

## Handle the return route

Create the route referenced by `callbackUrl` in your application router. CAPS completes payment validation before redirecting the user to this URL. Read the payment-result query parameters there and render the appropriate success, pending, cancellation, or failure state for your journey.

## Documentation

For integration modes, configuration details, complete examples, release notes, and migration information, see the [Club Med Payment SDK documentation](https://portal.api.clubmed/en-US/pages/caps).

## License

The MIT License (MIT)

Copyright (c) 2026 - Today ClubMed

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
