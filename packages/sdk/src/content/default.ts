import type { CapsTheme } from '../embed/shared';
import wechatScanUrl from '../integrations/wechat/assets/wechat-scan.webp';
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
    moreInformation: 'More information',
    close: 'Close',
    full: {
      title: 'Pay in full today',
      description: 'I pay today the total amount of',
      caption: 'Total price',
    },
    deposit: {
      title: 'Pay in 2x',
      description: 'I pay a {deposit} deposit today followed by {balance} on {deadline}',
      info: 'The due date for the balance is indicated on your booking confirmation, and free payment options are available until this payment',
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
      cardTitle: 'I pay in',
      cardDescription: 'by credit card',
    },
  },
  cgv: {
    heading: 'General Terms and Conditions of Sale',
    terms:
      'I acknowledge that confirming my booking entails a payment obligation. I accept the [General Terms and Conditions of Sale and confirm that I have also read the Information Form.]()',
    validation: {
      mustAccept: 'Please accept the terms and conditions of sale',
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
    expiryDate: 'Expiration',
    cvc: 'Security code (CVV)',
    placeholders: {
      cardHolder: 'Surname Name',
      cardNumber: 'XXXX XXXX XXXX XXXX',
      expiryDate: 'YYYY / MM',
      cvc: 'XXX',
    },
    hints: {
      cardHolder: 'As written on the card',
      cardNumber: '16 digits',
      expiryDate: 'YYYY / MM',
      cvc: '3 or 4 digits',
    },
    validation: {
      expiryDate: 'Expiry date is required',
      expiryDateInvalid: 'Enter a valid expiration date',
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
    sameAsMainTraveler: 'Same as main traveler',
    mandatoryField: '*Mandatory field',
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
    instruction:
      'After you press continue, please scan the QR code with the WeChat Pay scanner. Total amount due {amount}',
    payLabel: 'Scan now to pay:',
    imageUrl: wechatScanUrl,
    imageAlt: 'Scanning the QR code on the screen with WeChat on a phone',
    qrCodeLabel: 'WeChat Pay QR code',
    expiredMessage: 'Transaction expired',
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
    otherAmount: 'Other amount',
    otherAmountPlaceholder: 'Enter an amount',
    terms: 'I accept the [terms and conditions]() of my donation',
    confirm: 'Confirm',
    remove: 'Remove -{amount}',
    infoLabel: 'Information about donation',
    closeLabel: 'Close',
    validation: {
      mustAccept: 'Please accept the terms and conditions of your donation',
    },
    errors: {
      noAmount: 'Select an amount',
      invalidAmount: 'Enter a valid amount',
    },
  },
  paymentWidget: {
    heading: 'Payment details',
  },
  submit: {
    label: 'Pay',
    pay: 'Pay {amount} now',
    redirect: 'Go to our payment partner',
    continue: 'Continue',
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
  donation: { terms: 'I accept the [donation terms and conditions]()' },
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
