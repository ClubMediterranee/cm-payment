export type HipayError = {
  field: string;
  error: string;
};

export type HipayPaymentData = {
  token: string;
  payment_product: string;
  browser_info: unknown;
};

export type HipayFieldValidity = {
  valid: boolean;
  empty: boolean;
  error?: string;
  error_code?: string;
  potentiallyValid: boolean;
  disabled: boolean;
  focused: boolean;
};

export type HipayInputChangeData = {
  element: string;
  validity: HipayFieldValidity;
  valid: boolean;
};

export type HipayInstance = {
  on(event: 'ready', callback: () => void): void;
  on(event: 'inputChange', callback: (data: HipayInputChangeData) => void): void;
  on(event: 'change', callback: (data: { valid: boolean; errors: HipayError[] }) => void): void;
  getPaymentData: () => Promise<HipayPaymentData>;
  destroy: () => void;
};

export type HipayPaypalOptions = {
  canPayLater: boolean;
  request: {
    amount: number;
    currency: string;
    locale: string;
  };
  paypalButtonStyle: {
    shape: string;
    color: string;
    height: number;
  };
  template: string;
  selector: string;
};

export type HipaySDK = {
  create(
    type: 'card',
    options: { fields: Record<string, { placeholder: string; selector: string }> },
  ): HipayInstance;
  create(type: 'paypal', options: HipayPaypalOptions): HipayInstance;
};

export type Hipay = (config: {
  environment: string;
  username: string;
  password: string;
}) => HipaySDK;

export type HipayCardOptions = {
  type: 'card';
  fields: {
    cardHolder: { placeholder: string; selector: string };
    cardNumber: { placeholder: string; selector: string };
    cvc: { placeholder: string; selector: string };
    expiryDate: { placeholder: string; selector: string };
  };
};

export type HipayPaypalCreateOptions = {
  type: 'paypal';
  amount: number;
  currency: string;
  locale: string;
  selector?: string;
  style?: {
    shape?: string;
    color?: string;
    height?: number;
  };
};

export type HipayClientOptions = HipayCardOptions | HipayPaypalCreateOptions;

export type HipayEventMap = {
  ready: () => void;
  inputChange: (data: HipayInputChangeData) => void;
  change: (data: { valid: boolean; errors: HipayError[] }) => void;
  paymentAuthorized: (data: { orderID: string }) => void;
  error: (error: unknown) => void;
};

export type HipayConfig = {
  environment: string;
  username: string;
  password: string;
};

export type CardOptions = {
  cardHolder: { placeholder: string; selector: string };
  cardNumber: { placeholder: string; selector: string };
  cvc: { placeholder: string; selector: string };
  expiryDate: { placeholder: string; selector: string };
};

export type PaypalOptions = {
  amount: number;
  currency: string;
  locale: string;
  selector: string;
};

export type CardEvents = {
  ready?: () => void;
  inputChange?: (data: HipayInputChangeData) => void;
  change?: (data: { valid: boolean; errors: HipayError[] }) => void;
};

export type PaypalEvents = {
  ready?: () => void;
  paymentAuthorized?: (data: { orderID: string }) => void;
  error?: (error: unknown) => void;
};

export type CreateHipayClientParams =
  | {
      type: 'card';
      config: HipayConfig;
      options: CardOptions;
      events?: CardEvents;
    }
  | {
      type: 'paypal';
      config: HipayConfig;
      options: PaypalOptions;
      events?: PaypalEvents;
    };
