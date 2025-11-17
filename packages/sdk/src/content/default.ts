import { Content } from '../types/Content';

export const defaultContent: Content = {
  paymentProviders: {
    validation: {
      required: 'You must choose a payment method',
    },
    creditCard: {
      label: 'I pay by credit card the amount of {amount}',
    },
    paypal: {
      label: 'I pay by PayPal the amount of {amount}',
    },
    bankTransfer: {
      label: 'I pay by bank transfer the amount of {amount}',
      security: 'Secure 100% payment (direct connection with your bank)',
      paymentCap: 'No payment limit for standard bank transfers',
    },
  },
  paymentSchedule: {
    payAmount: 'I pay the amount of {amount}',
    deadline: 'before {deadline}',
  },
  cgv: {
    title: 'Terms and Conditions',
    content:
      'Validating my reservation implies a payment obligation. [FBL] I am informed of the obligation to present a negative test result or proof of complete vaccination for Covid-19 to access the Resort between May 21 and September 30, 2021 (details on the Resort page). I accept the General Conditions of Sale and declare that I have also read the Information Form.*',
    validation: {
      required: 'You must accept the terms and conditions',
      mustAccept: 'You must accept the T&C',
    },
  },
  contactChoice: {
    title: 'What type of channel?',
    choiceLabel: 'By {label}',
    choices: {
      email: 'Email',
      phone: 'Phone',
    },
  },
  creditCardForm: {
    title: 'Card details',
    fullName: 'Cardholder name',
    cardNumber: 'Card number',
    expiryDate: 'Expiry date',
    cvc: 'Security code',
  },
};
