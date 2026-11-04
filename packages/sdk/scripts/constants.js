export const CategoryPaymentMethod = [
  'CreditCard',
  'BankTransfer',
  'DirectDebit',
  'BuyNowPayLater',
  'Cheque',
  'Paypal',
  '',
];

export const UnsupportedAction = ['BANK_CARD_TOKENIZATION_EASY_CHECKIN'];

export const CybersourceTokenRequestParams = {
  type: 'object',
  properties: {
    target_origins: {
      type: 'string',
      description: 'The target origin URL for Cybersource integration',
    },
    booking_id: {
      type: 'string',
      description: 'Optional booking ID',
    },
  },
  required: ['target_origins'],
};

export const TokenRequestModelSchema = {
  type: 'object',
  properties: {
    params: {
      oneOf: [
        {
          $ref: '#/components/schemas/CybersourceTokenRequestParams',
        },
      ],
    },
  },
  required: ['params'],
};
