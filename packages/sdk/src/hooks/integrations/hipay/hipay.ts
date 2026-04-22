import type {
  CardOptions,
  CreateHipayClientParams,
  Hipay,
  HipayConfig,
  HipayError,
  HipayInstance,
  PaypalOptions,
} from '../../../types/Hipay';

const initializeHiPay = (config: HipayConfig) => {
  const HiPay = (window as unknown as Window & { HiPay: Hipay }).HiPay;
  return HiPay(config);
};

const hipayOptionsBuilders = {
  card: (options: CardOptions) => ({
    fields: {
      cardHolder: options.cardHolder,
      cardNumber: options.cardNumber,
      cvc: options.cvc,
      expiryDate: options.expiryDate,
    },
  }),

  paypal: (options: PaypalOptions) => ({
    canPayLater: false,
    request: {
      amount: options.amount,
      currency: options.currency,
      locale: options.locale,
    },
    paypalButtonStyle: {
      shape: 'pill',
      color: 'gold',
      height: 45,
    },
    template: 'auto',
    selector: options.selector,
  }),
} as const;

export function createHipayClient(params: CreateHipayClientParams): HipayInstance {
  const { type, config, options, events } = params;
  const hipay = initializeHiPay(config);
  const instance = hipay.create(type as any, hipayOptionsBuilders[type](options as any) as any);

  Object.entries(events ?? {}).forEach(([event, callback]) =>
    callback ? instance.on(event as any, callback) : null,
  );

  return instance;
}

export const mapHipayErrorsToObject = (hipayErrors: HipayError[]): Record<string, string> => {
  return hipayErrors.reduce((acc, { field, error }) => ({ ...acc, [field]: error }), {});
};
