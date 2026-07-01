export interface IxopayFieldInputData {
  validNumber?: boolean;
  numberLength?: number;
  validCvv?: boolean;
  cvvLength?: number;
}

export interface IxopayFieldState {
  valid: boolean;
  length: number;
  touched: boolean;
  errorMessage?: string;
}

export interface IxopayError {
  attribute: string;
  key: string;
  message: string;
}

export interface IxopayEventData {
  cvvLength: number;
  numberLength: number;
  validCvv: boolean;
  validNumber: boolean;
}

export type IxopayEventType =
  | 'input'
  | 'focus'
  | 'blur'
  | 'mouseover'
  | 'mouseout'
  | 'enter'
  | 'esc'
  | 'tab'
  | 'shift-tab';

export interface IxopayPayment {
  setNumberStyle(style: Record<string, string>): void;
  setCvvStyle(style: Record<string, string>): void;
  setNumberPlaceholder(text: string): void;
  setCvvPlaceholder(text: string): void;
  numberOn(event: IxopayEventType, callback: (data: IxopayEventData) => void): void;
  cvvOn(event: IxopayEventType, callback: (data: IxopayEventData) => void): void;
}

export interface IxopayPaymentJs {
  init(
    integrationKey: string,
    numberSelector: string,
    cvvSelector: string,
    callback: (payment: IxopayPayment) => void,
  ): void;
  tokenize(
    data: {
      card_holder: string;
      month: string;
      year: string;
    },
    onSuccess: (token: string) => void,
    onError: (errors: IxopayError[]) => void,
  ): void;
}

export interface IxopayConfig {
  script_url: string;
  integration_key: string;
  display_type: 'hosted_field';
}

declare global {
  interface Window {
    PaymentJs?: new (version: string) => IxopayPaymentJs;
  }
}
