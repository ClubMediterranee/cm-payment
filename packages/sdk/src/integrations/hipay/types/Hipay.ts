export type HipayField = 'cardHolder' | 'cardNumber' | 'expiryDate' | 'cvc';

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
  element: HipayField;
  validity: HipayFieldValidity;
  valid: boolean;
};

export type HipayFieldEventData = {
  element: HipayField;
};

export type HipayFieldStyle = {
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: number;
  placeholderColor?: string;
  caretColor?: string;
  iconColor?: string;
};

export type HipayStyles = {
  base?: HipayFieldStyle;
  valid?: HipayFieldStyle;
  invalid?: HipayFieldStyle;
  disable?: HipayFieldStyle;
};

export type HipayInstance = {
  on<E extends keyof HipayEventMap>(event: E, callback: HipayEventMap[E]): void;
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
    options: {
      fields: CardOptions;
      styles?: HipayStyles;
    },
  ): HipayInstance;
  create(type: 'paypal', options: HipayPaypalOptions): HipayInstance;
};

export type Hipay = (config: HipayConfig) => HipaySDK;

export type HipayEventMap = {
  ready: () => void;
  inputChange: (data: HipayInputChangeData) => void;
  focus: (data: HipayFieldEventData) => void;
  blur: (data: HipayFieldEventData) => void;
  change: (data: { valid: boolean; errors: HipayError[] }) => void;
  paymentAuthorized: (data: { orderID: string }) => void;
  error: (error: unknown) => void;
};

export type HipayConfig = {
  environment: string;
  username: string;
  password: string;
};

export type CardOptions = Record<HipayField, { placeholder: string; selector: string }>;

export type PaypalOptions = {
  amount: number;
  currency: string;
  locale: string;
  selector: string;
};

export type CardEvents = Partial<
  Pick<HipayEventMap, 'ready' | 'inputChange' | 'focus' | 'blur' | 'change'>
>;

export type PaypalEvents = Partial<Pick<HipayEventMap, 'ready' | 'paymentAuthorized' | 'error'>>;

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

declare global {
  interface Window {
    HiPay: Hipay;
  }
}
