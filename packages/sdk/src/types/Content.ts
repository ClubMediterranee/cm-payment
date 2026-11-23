export type Content = {
  paymentProviders: {
    heading: string;
    validation: {
      required: string;
    };
    creditCard: {
      label: `${string}{amount}${string}`;
      description: string;
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
    heading: string;
    select: string;
    selected: string;
    full: {
      title: string;
      description: string;
      caption: string;
    };
    deposit: {
      title: string;
      description: `${string}{deposit}${string}` &
        `${string}{balance}${string}` &
        `${string}{deadline}${string}`;
    };
    monthly: {
      title: string;
      from: string;
      caption: string;
      unavailable: string;
      simulationLabel: `${string}{icon}${string}{total}${string}{cost}${string}{instalments}${string}`;
      instalmentItem: `${string}{amount}${string}{date}${string}`;
      instalmentFirst: `${string}{date}${string}`;
      instalmentOther: `${string}{count}${string}{date}${string}`;
      feesInclude: `${string}{amount}${string}`;
    };
    installments: {
      title: `${string}{icon}${string}`;
    };
  };
  cgv: {
    heading: string;
    content: string;
    validation: {
      mustAccept: string;
    };
  };
  comments: {
    heading: string;
    placeholder: string;
    validation: {
      required: string;
    };
  };
  contactChoice: {
    heading: string;
    validation: {
      required: string;
    };
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
    fields: Record<'email' | 'mobile_phone', { label: string; placeholder: string }>;
  };
  creditCardForm: {
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
      cardHolder: string;
      cvcRequired: string;
    };
  };
  freeDeposit: {
    totalRemaining: string;
    before: string;
    payNowLabel: string;
    placeholder: string;
    validation: {
      positive: string;
      maxExceeded: string;
    };
    overpaymentConfirmation: {
      title: string;
      description: string;
      confirm: string;
      cancel: string;
    };
  };
  cardInstallments: {
    heading: string;
    selectCardType: string;
    selectInstallments: string;
    placeholder: string;
    installmentLabel: `${string}{count}${string}{amount}${string}`;
    validation: {
      methodRequired: string;
      conditionRequired: string;
    };
  };
  billingAddress: {
    heading: string;
    additionalInformation: string;
    hints: {
      first_name: string;
      last_name: string;
    };
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
    };
  };
  wechat: {
    payLabel: string;
    scanLabel: string;
    tutorial: {
      title: string;
      subtitle: string;
      imageUrl: string;
      expiredMessage: string;
    };
  };
  donation: {
    heading: string;
    title: string;
    description: string;
    notThisTime: string;
    freeAmount: string;
    imageUrl: string;
    popinTitle: string;
    popinDescription: string;
    popinFiscalInfo: string;
    acceptCGU: string;
    donationTerms: string;
    linkDonationTerms: string;
  };
  paymentWidget: {
    heading: string;
  };
  submit: {
    label: string;
    pay: `${string}{amount}${string}`;
    redirect: string;
  };
};

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? T[K] : DeepPartial<T[K]> };
