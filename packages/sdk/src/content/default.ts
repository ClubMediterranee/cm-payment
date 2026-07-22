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
    buyNowPayLater: {
      iconLabel: 'I pay in {icon} by credit card',
      priceLabel: 'Pay monthly from {price}',
      unavailable: 'Pay Monthly is currently unavailable',
    },
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
  comments: {
    placeholder: 'Enter your comments',
    validation: {
      required: 'Comments are required',
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
    validation: {
      expiryDate: 'Expiry date is required',
      expired: 'Card is expired',
      cardHolder: 'Cardholder name is required',
      cardNumber: 'Invalid card number',
      cardNumberRequired: 'Card number is required',
      cvc: 'Invalid security code',
      cvcRequired: 'Security code is required',
    },
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
  billingAddress: {
    title: 'Billing Address',
    fields: {
      first_name: 'First Name',
      last_name: 'Last Name',
      number: 'Street Number',
      street: 'Street',
      add_on: 'Additional Information',
      city: 'City',
      state_or_district: 'State / Province',
      zip_code: 'Postal Code',
      country: 'Country',
      country_code: 'Country',
      additional_information_1: 'Additional Information 1',
      additional_information_2: 'Additional Information 2',
      town: 'Town',
    },
    placeholders: {
      select: 'Select an option',
    },
    validation: {
      required: 'This field is required',
      maxLength: 'Maximum length exceeded',
      pattern: 'Invalid format',
      invalidValue: 'Invalid value',
    },
    errors: {
      schemaFetchFailed: 'Failed to load billing address form. Please try again.',
      schemaInvalid: 'Billing address form configuration error. Please contact support.',
    },
  },
  wechat: {
    payLabel: 'Scan now to pay:',
    scanLabel: 'Please scan',
    tutorial: {
      title: 'After you press continue',
      subtitle: 'please scan the QRCode within the WeChat to pay scanner',
      imageUrl: 'https://ns.clubmed.com/it/2018/be/payment/wechat.png',
      expiredMessage: 'Transaction expired',
    },
  },
  donation: {
    title: 'Make a donation to the Friends of the Foundation',
    description:
      "Would you like to make a donation to support the Foundation's projects for education and nature conservation around Club Med Villages?",
    notThisTime: 'Not this time!',
    freeAmount: 'Free amount',
    imageUrl: 'https://ns.clubmed.com/it/2019/be/donation.jpg',
    popinTitle: 'Friends of the Foundation',
    popinDescription:
      "Would you like to make a donation to support the Foundation's projects for education and nature conservation around Club Med Villages?",
    popinFiscalInfo:
      'Your donation is tax deductible. You will receive a tax receipt after your donation.',
    acceptCGU: 'I accept the donation terms and conditions',
    donationTerms: 'donation terms and conditions',
    linkDonationTerms: '',
  },
};
