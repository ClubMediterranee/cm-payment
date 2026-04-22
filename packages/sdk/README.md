<div style="text-align: center" align="center">
 <img src="https://ns.clubmed.com/fbs/RWD/branding2023/Logo/MicrosoftTeams-image%20(9).png" width="200" alt="Club Med"/>
</div>

<div align="center">
   <h1>@clubmed/caps</h1>
   <hr />

[![npm version](https://badge.fury.io/js/%40clubmed%2Fpayment-sdk.svg)](https://badge.fury.io/js/%40clubmed%2Fpayment-sdk)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

</div>

## Introduction

`cm-payment` is a React 18 SDK designed to facilitate payment form integration in your application. It utilizes:

- **TanStack Query** for data management
- **react-hook-form** for form handling
- **Trident UI** for design

## Installation

To install the SDK, run:

```sh
npm install cm-payment @tanstack/react-query react-hook-form @clubmed/trident-ui
```

## Usage

### Initializing the SDK

Before using the SDK, initialize it by setting up fetch options:

```tsx
import { paymentSDK } from 'cm-payment';

paymentSDK.setFetchOptions({
  apiKey: 'YOUR_API_KEY',
  getAccessToken: getMyAccessToken(),
  locale: 'YOUR_LOCALE',
});
```

### Building the Payment Form

The form must be built using the React components provided by the SDK and wrapped inside the `FormProvider` from `cm-payment`.

```tsx
import { FormProvider, CardNumberField, ExpiryDateField, CVCField, SubmitButton } from 'cm-payment';

const PaymentForm = () => {
  return (
    <FormProvider {...props}>
      <PaymentSchedule />
      <PaymentProviders />
      <Cgv />
      <SubmitButton label="Pay Now" />
    </FormProvider>
  );
};
```

### Handling Payment Confirmation

Your application should have a dedicated route for payment confirmation. This route will intercept a path parameter called `paymentId` and validate the payment before redirecting to the final confirmation page.

#### Example Route Setup

```tsx
import { usePaymentConfirmation } from 'cm-payment';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const PaymentConfirmation = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  usePaymentConfirmation({ paymentId });

  return <div>Processing your payment...</div>;
};
```

## Conclusion

By following these steps, you can integrate the `cm-payment` SDK seamlessly into your React 18 application. Ensure that you correctly initialize the SDK, use the provided form components, and handle payment confirmation efficiently.

For further details, refer to the official documentation or reach out to support.
