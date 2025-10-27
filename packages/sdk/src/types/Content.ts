export type SDKContent = {
  paymentProviders: {
    validation: {
      required: string;
    };
    creditCard: {
      label: `${string}{amount}${string}{currency}${string}`;
    };
    paypal: {
      label: `${string}{amount}${string}{currency}${string}`;
    };
    bankTransfer: {
      label: `${string}{amount}${string}{currency}${string}`;
      security: string;
      paymentCap: string;
    };
  };
  paymentSchedule: {
    payAmount: `${string}{amount}${string}{currency}${string}`;
    deadline: `${string}{deadline}${string}`;
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
    title: string;
    choiceLabel: `${string}{label}${string}`;
    choices: {
      email: string;
      phone: string;
    };
  };
};
