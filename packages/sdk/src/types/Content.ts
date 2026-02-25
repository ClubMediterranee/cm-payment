export type Content = {
  paymentProviders: {
    validation: {
      required: string;
    };
    creditCard: {
      label: `${string}{amount}${string}`;
    };
    paypal: {
      label: `${string}{amount}${string}`;
    };
    bankTransfer: {
      label: `${string}{amount}${string}`;
      security: string;
      paymentCap: string;
    };
  };
  paymentSchedule: {
    payFullAmount: `${string}{amount}${string}`;
    payDeposit: `${string}{amount}${string}{deadline}${string}{balance}${string}`;
  };
  cgv: {
    title: string;
    content: string;
    validation: {
      required: string;
      mustAccept: string;
    };
  };
  contactChoice: {
    validation: {
      required: string;
    };
    title: string;
    choiceLabel: `${string}{label}${string}`;
    mobile_phone: {
      sendLink: string;
      invalid: string;
    };
    email: {
      sendLink: string;
      invalid: string;
    };
    call: {
      sendLink: string;
    };
    choices: {
      email: string;
      mobile_phone: string;
      call: string;
    };
  };
  creditCardForm: {
    title: string;
    fullName: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    validation: {
      expiryDate: string;
      expired: string;
      cardNumber: string;
      cardNumberRequired: string;
      cvc: string;
      cvcRequired: string;
    };
  };
  freeDeposit: {
    title: string;
    totalRemaining: string;
    before: string;
    payNowLabel: string;
    placeholder: string;
    validation: {
      required: string;
      positive: string;
      maxExceeded: string;
    };
  };
  cardInstallments: {
    title: string;
    selectCardType: string;
    selectInstallments: string;
    installmentLabel: `${string}{count}${string}{amount}${string}`;
    validation: {
      methodRequired: string;
      conditionRequired: string;
    };
  };
  billingAddress: {
    title: string;
    fields: {
      first_name: string;
      last_name: string;
      number: string;
      street: string;
      add_on: string;
      city: string;
      state_or_district: string;
      zip_code: string;
      country: string;
      country_code: string;
      additional_information_1: string;
      additional_information_2: string;
      town: string;
    };
    placeholders: {
      select: string;
    };
    validation: {
      required: string;
      maxLength: string;
      pattern: string;
      invalidValue: string;
    };
    errors: {
      schemaFetchFailed: string;
      schemaInvalid: string;
    };
  };
};
