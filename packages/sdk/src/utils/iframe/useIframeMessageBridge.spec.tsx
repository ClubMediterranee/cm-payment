import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { defaultContent } from '../../content/default';
import { CapsConfigContext } from '../../contexts/CapsConfigContext';
import { CapsSettings, OidcIssuerTypes } from '../../types/CapsSettings';
import { IframeMessageType } from './constants';
import { useIframeMessageBridge } from './useIframeMessageBridge';

const apiUrl = 'https://payment.gateway.com';

const mockConfig: CapsSettings = {
  type: 'booking',
  id: 'test-id',
  locale: 'fr-FR',
  country: 'FR',
  language: 'fr',
  oidc: {
    issuerType: OidcIssuerTypes.GM,
    accessToken: 'test-token',
  },
  api: {
    url: apiUrl,
    apiKey: 'test-key',
  },
  content: defaultContent,
  callbackUrl: 'https://callback.test.com',
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <CapsConfigContext.Provider value={mockConfig}>{children}</CapsConfigContext.Provider>
);

describe('useIframeMessageBridge', () => {
  let mockHandlers: {
    onRedirect: Mock<(url: string) => void>;
    onLoading: Mock<() => void>;
    onCancel: Mock<() => void>;
  };

  beforeEach(() => {
    mockHandlers = {
      onRedirect: vi.fn(),
      onLoading: vi.fn(),
      onCancel: vi.fn(),
    };
  });

  it('ajoute un event listener sur window au montage', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT]: mockHandlers.onRedirect,
        }),
      { wrapper: Wrapper },
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('retire le event listener au démontage', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT]: mockHandlers.onRedirect,
        }),
      { wrapper: Wrapper },
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('appelle le handler PAYMENT_REDIRECT avec URL quand message reçu', () => {
    renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT]: mockHandlers.onRedirect,
        }),
      { wrapper: Wrapper },
    );

    const messageEvent = new MessageEvent('message', {
      origin: 'https://payment.gateway.com',
      data: {
        type: IframeMessageType.PAYMENT_REDIRECT,
        url: 'https://example.com/success',
      },
    });

    window.dispatchEvent(messageEvent);

    expect(mockHandlers.onRedirect).toHaveBeenCalledWith('https://example.com/success');
  });

  it('appelle le handler PAYMENT_REDIRECT_LOADING quand message reçu', () => {
    renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT_LOADING]: mockHandlers.onLoading,
        }),
      { wrapper: Wrapper },
    );

    const messageEvent = new MessageEvent('message', {
      origin: 'https://payment.gateway.com',
      data: {
        type: IframeMessageType.PAYMENT_REDIRECT_LOADING,
      },
    });

    window.dispatchEvent(messageEvent);

    expect(mockHandlers.onLoading).toHaveBeenCalledWith(undefined);
  });

  it('appelle le handler PAYMENT_REDIRECT_CANCEL quand message reçu', () => {
    renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT_CANCEL]: mockHandlers.onCancel,
        }),
      { wrapper: Wrapper },
    );

    const messageEvent = new MessageEvent('message', {
      origin: 'https://payment.gateway.com',
      data: {
        type: IframeMessageType.PAYMENT_REDIRECT_CANCEL,
      },
    });

    window.dispatchEvent(messageEvent);

    expect(mockHandlers.onCancel).toHaveBeenCalledWith(undefined);
  });

  it("ignore les messages provenant d'une origine différente", () => {
    renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT]: mockHandlers.onRedirect,
        }),
      { wrapper: Wrapper },
    );

    const messageEvent = new MessageEvent('message', {
      origin: 'https://malicious.com',
      data: {
        type: IframeMessageType.PAYMENT_REDIRECT,
        url: 'https://example.com/success',
      },
    });

    window.dispatchEvent(messageEvent);

    expect(mockHandlers.onRedirect).not.toHaveBeenCalled();
  });

  it('ignore les messages avec type inconnu', () => {
    renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT]: mockHandlers.onRedirect,
        }),
      { wrapper: Wrapper },
    );

    const messageEvent = new MessageEvent('message', {
      origin: 'https://payment.gateway.com',
      data: {
        type: 'UNKNOWN_TYPE',
        url: 'https://example.com/success',
      },
    });

    window.dispatchEvent(messageEvent);

    expect(mockHandlers.onRedirect).not.toHaveBeenCalled();
  });

  it('ignore les messages avec type non géré par les handlers', () => {
    renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT]: mockHandlers.onRedirect,
        }),
      { wrapper: Wrapper },
    );

    const messageEvent = new MessageEvent('message', {
      origin: 'https://payment.gateway.com',
      data: {
        type: IframeMessageType.PAYMENT_REDIRECT_LOADING,
      },
    });

    window.dispatchEvent(messageEvent);

    expect(mockHandlers.onRedirect).not.toHaveBeenCalled();
    expect(mockHandlers.onLoading).not.toHaveBeenCalled();
  });

  it('gère plusieurs handlers simultanément', () => {
    renderHook(
      () =>
        useIframeMessageBridge({
          [IframeMessageType.PAYMENT_REDIRECT]: mockHandlers.onRedirect,
          [IframeMessageType.PAYMENT_REDIRECT_LOADING]: mockHandlers.onLoading,
          [IframeMessageType.PAYMENT_REDIRECT_CANCEL]: mockHandlers.onCancel,
        }),
      { wrapper: Wrapper },
    );

    const redirectEvent = new MessageEvent('message', {
      origin: 'https://payment.gateway.com',
      data: {
        type: IframeMessageType.PAYMENT_REDIRECT,
        url: 'https://example.com/success',
      },
    });

    const loadingEvent = new MessageEvent('message', {
      origin: 'https://payment.gateway.com',
      data: {
        type: IframeMessageType.PAYMENT_REDIRECT_LOADING,
      },
    });

    window.dispatchEvent(redirectEvent);
    window.dispatchEvent(loadingEvent);

    expect(mockHandlers.onRedirect).toHaveBeenCalledWith('https://example.com/success');
    expect(mockHandlers.onLoading).toHaveBeenCalledWith(undefined);
  });
});
