import { CapsMessageType } from '../../embed/shared/protocol';

/**
 * Messages exchanged with the PSP iframe. Values come from the shared embed protocol.
 */
export const IframeMessageType = {
  PAYMENT_REDIRECT: CapsMessageType.PAYMENT_REDIRECT,
  PAYMENT_REDIRECT_LOADING: CapsMessageType.PAYMENT_REDIRECT_LOADING,
  PAYMENT_REDIRECT_CANCEL: CapsMessageType.PAYMENT_REDIRECT_CANCEL,
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
