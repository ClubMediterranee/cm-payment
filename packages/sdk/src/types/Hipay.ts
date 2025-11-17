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
};

export type HipaySDK = {
  create: (
    type: string,
    options: { fields: Record<string, { placeholder: string; selector: string }> },
  ) => HipayInstance;
};

export type Hipay = (config: {
  environment: string;
  username: string;
  password: string;
}) => HipaySDK;
