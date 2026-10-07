import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IframeMessageType } from './constants';
import { sendIframeMessage } from './sendMessage';

describe('sendIframeMessage', () => {
  beforeEach(() => {
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  it('envoie un message PAYMENT_REDIRECT avec URL', () => {
    const message = {
      type: IframeMessageType.PAYMENT_REDIRECT,
      url: 'https://example.com/success',
    };

    sendIframeMessage(message, 'https://caps.example');

    expect(window.parent.postMessage).toHaveBeenCalledWith(message, 'https://caps.example');
  });

  it('envoie un message PAYMENT_REDIRECT_LOADING', () => {
    const message = {
      type: IframeMessageType.PAYMENT_REDIRECT_LOADING,
    };

    sendIframeMessage(message, 'https://caps.example');

    expect(window.parent.postMessage).toHaveBeenCalledWith(message, 'https://caps.example');
  });

  it('envoie un message PAYMENT_REDIRECT_CANCEL', () => {
    const message = {
      type: IframeMessageType.PAYMENT_REDIRECT_CANCEL,
    };

    sendIframeMessage(message, 'https://caps.example');

    expect(window.parent.postMessage).toHaveBeenCalledWith(message, 'https://caps.example');
  });

  it("n'utilise jamais le targetOrigin wildcard", () => {
    const message = {
      type: IframeMessageType.PAYMENT_REDIRECT_LOADING,
    };

    sendIframeMessage(message, 'https://caps.example');

    expect(window.parent.postMessage).not.toHaveBeenCalledWith(expect.anything(), '*');
  });
});
