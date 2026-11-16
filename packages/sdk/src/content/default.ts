import type { CapsTheme } from '../embed/shared';
import type { Content } from '../types/Content';
import { mergeFromPattern } from '../utils/mergeFromPattern';

export const defaultContent: Content = {
  paymentProviders: {
    heading: 'How do you want to pay?',
    validation: {
      required: 'You must choose a payment method',
    },
    creditCard: {
      label: 'I pay by credit card the amount of {amount}',
      description: 'Secure payment with possible 3D Secure verification',
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
    heading: 'Choose the payment schedule',
    select: 'Select this option',
    selected: 'Selected option',
    full: {
      title: 'Pay in full today',
      description: 'I pay the total amount of',
      caption: 'Total price',
    },
    deposit: {
      title: 'Pay in 2x',
      description:
        'I pay by credit card the deposit of {deposit}, and I agree to an automatic withdrawal of the remaining balance of {balance} on {deadline}',
    },
    monthly: {
      title: 'Pay monthly',
      from: 'from',
      caption: 'Per month',
      unavailable: 'Pay Monthly is currently unavailable',
      simulationLabel:
        'I pay in {icon} a total of {total} (incl. {cost} financing cost): {instalments}',
      instalmentItem: '{amount} on {date}',
      instalmentFirst: '1st due date on {date}',
      instalmentOther: '{count}th due date on {date}',
      feesInclude: '(including {amount} € of costs)',
    },
    installments: {
      title: 'I pay in {icon} by credit card',
    },
  },
  cgv: {
    heading: 'General Terms and Conditions of Sale',
    content:
      'Validating my reservation implies a payment obligation. [FBL] I am informed of the obligation to present a negative test result or proof of complete vaccination for Covid-19 to access the Resort between May 21 and September 30, 2021 (details on the Resort page). I accept the General Conditions of Sale and declare that I have also read the Information Form.*',
    validation: {
      mustAccept: 'You must accept the T&C',
    },
  },
  comments: {
    heading: 'Comments',
    placeholder: 'Enter your comments',
    validation: {
      required: 'Comments are required',
    },
  },
  contactChoice: {
    heading: 'How would you like to be contacted?',
    choiceLabel: 'By {label}',
    validation: {
      required: 'Contact choice information is required',
    },
    choices: {
      email: 'Email',
      call: 'Phone',
      mobile_phone: 'SMS',
    },
    fields: {
      email: { label: 'Email address', placeholder: 'Ex: client@email.com' },
      mobile_phone: { label: 'Mobile phone', placeholder: 'Ex: +33 6 12 34 56 78' },
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
    totalRemaining: 'Total due :',
    before: 'Before',
    payNowLabel: 'Amount desired by the client',
    placeholder: 'Please enter an amount',
    validation: {
      positive: 'The amount must be greater than 0',
      maxExceeded: 'The amount cannot exceed the remaining total',
    },
    overpaymentConfirmation: {
      title: 'Payment above the due amount',
      description: 'The amount you entered exceeds the amount due. Do you wish to proceed?',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
  },
  cardInstallments: {
    heading: 'Choose your card installments',
    selectCardType: 'Select your card type',
    selectInstallments: 'Select the number of installments',
    placeholder: 'Choose',
    installmentLabel: '{count} X of {amount}',
    validation: {
      methodRequired: 'Please select a payment method',
      conditionRequired: 'Please select the number of installments',
    },
  },
  billingAddress: {
    heading: 'Billing address',
    additionalInformation: 'Additional information',
    hints: {
      first_name: 'Matching Passport/ID',
      last_name: 'Matching Passport/ID',
    },
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
    heading: 'Make a donation',
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
  paymentWidget: {
    heading: 'Payment details',
  },
  submit: {
    label: 'Pay',
    pay: 'Pay {amount} now',
    redirect: 'Go to our payment partner',
  },
};

export const DEFAULT_CAPS_THEME: CapsTheme = 'legacy';

const legacyContent: Content = mergeFromPattern(defaultContent, {
  paymentProviders: { heading: 'Which payment method would you like to use?' },
  paymentSchedule: {
    heading: 'Choose your payment schedule',
    full: { description: 'I pay today the full amount of' },
    deposit: {
      description:
        'I pay today, at no charge, a deposit of {deposit} and at the latest on {deadline} the balance of {balance}',
    },
  },
  cgv: { heading: 'Terms and conditions' },
  freeDeposit: {
    totalRemaining: 'Total remaining to pay',
    before: 'before',
    payNowLabel: 'I pay now',
  },
});

export const contentByTheme: Record<CapsTheme, Content> = {
  current: defaultContent,
  legacy: legacyContent,
};
