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
  };
};
