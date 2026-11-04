export const IframeMessageType = {
  PAYMENT_REDIRECT: 'CAPS_PAYMENT_REDIRECT',
  PAYMENT_REDIRECT_LOADING: 'CAPS_PAYMENT_REDIRECT_LOADING',
  PAYMENT_REDIRECT_CANCEL: 'CAPS_PAYMENT_REDIRECT_CANCEL',
} as const;

export type IframeMessageType = (typeof IframeMessageType)[keyof typeof IframeMessageType];

export type IframeMessage =
  | {
      type: typeof IframeMessageType.PAYMENT_REDIRECT;
      url: string;
    }
  | {
      type: typeof IframeMessageType.PAYMENT_REDIRECT_LOADING;
    }
  | {
      type: typeof IframeMessageType.PAYMENT_REDIRECT_CANCEL;
    };
