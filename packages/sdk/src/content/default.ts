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
    payFullAmount: 'I pay today the full amount of {amount}',
    payDeposit:
      'I pay today, at no charge, a deposit of {amount} and at the latest on {deadline} the balance of {balance}',
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
    validation: {
      required: 'Contact choice information is required',
    },
    choices: {
      email: 'Email',
      call: 'Phone',
      mobile_phone: 'SMS',
    },
    call: {
      sendLink:
        'To complete the payment, you will be prompted to request the client’s various payment information. You will be able to track your client’s payment progress in real time.',
    },
    email: {
      invalid: 'Invalid email',
      sendLink:
        'To complete the payment, we will immediately send your client an email with a payment link. You will need to track your client’s payment progress in real time.',
    },
    mobile_phone: {
      invalid: 'Invalid phone number',
      sendLink:
        'To complete the payment, we will immediately send a payment link to your client’s phone number. You will need to track your client’s payment progress in real time.',
    },
  },
  creditCardForm: {
    title: 'Card details',
    fullName: 'Cardholder name',
    cardNumber: 'Card number',
    expiryDate: 'Expiry date',
    cvc: 'Security code',
  },
  freeDeposit: {
    title: 'Pay the amount of your choice without fees',
    totalRemaining: 'Total remaining to pay',
    before: 'before',
    payNowLabel: 'I pay now',
    placeholder: 'Please enter an amount',
    validation: {
      required: 'Please enter an amount',
      positive: 'The amount must be greater than 0',
      maxExceeded: 'The amount cannot exceed the remaining total',
    },
  },
  cardInstallments: {
    title: 'Payment method',
    selectCardType: 'Select your card type',
    selectInstallments: 'Select the number of installments',
    installmentLabel: '{count} X of {amount}',
    validation: {
      methodRequired: 'Please select a payment method',
      conditionRequired: 'Please select the number of installments',
    },
  },
};
