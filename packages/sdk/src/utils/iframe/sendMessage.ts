import { IframeMessage } from './constants';

/**
 * Post a message to the parent window. The target origin is mandatory: messages are never broadcast to `'*'`.
 */
export const sendIframeMessage = (message: IframeMessage, targetOrigin: string) => {
  window.parent.postMessage(message, targetOrigin);
};
