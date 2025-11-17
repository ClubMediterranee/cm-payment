import { render, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { Action } from '../__generated__';
import { defaultContent } from '../content/default';
import { OidcIssuerTypes } from '../types/SDKOptions';
import { getSDKPaymentOptions, SDKConfigProvider, useSDKConfig } from './SDKConfigProvider';

describe('SDKConfigProvider', () => {
  const defaultProps = {
    url: 'https://example.com',
    proposalId: 'prop-123',
    bookingId: '',
    customerId: 'cust-456',
    locale: 'fr-FR',
    oidc: {
      issuerType: OidcIssuerTypes.GM,
      accessToken: '',
      authority: 'https://auth.example.com',
    },
    api: {
      url: 'https://api.example.com',
      apiKey: 'test-key',
    },
    callbackUrl: 'https://example.com/callback',
  };

  const Wrapper = ({ children, ...props }: PropsWithChildren<any>) => (
    <SDKConfigProvider {...defaultProps} {...props}>
      {children}
    </SDKConfigProvider>
  );

  it('should provide SDK config context', () => {
    const { result } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} />,
    });

    expect(result.current.url).toBe(defaultProps.url);
    expect(result.current.proposalId).toBe(defaultProps.proposalId);
    expect(result.current.locale).toBe(defaultProps.locale);
  });

  it('should use explicit action when provided', () => {
    const { result } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} action={Action.PAYMENT_RESA} />,
    });

    expect(result.current.action).toBe(Action.PAYMENT_RESA);
  });

  it('should default to PAYMENT_SOLDE when bookingId is provided and no action', () => {
    const { result } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} bookingId="booking-123" />,
    });

    expect(result.current.action).toBe(Action.PAYMENT_SOLDE);
  });

  it('should default to PAYMENT_RESA when no bookingId and no action', () => {
    const { result } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} bookingId="" />,
    });

    expect(result.current.action).toBe(Action.PAYMENT_RESA);
  });

  it('should merge custom content with default content', () => {
    const customContent = {
      cgv: {
        title: 'Custom Terms',
      },
    } as any;

    const { result } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} content={customContent} />,
    });

    expect(result.current.content.cgv.title).toBe('Custom Terms');
    expect(result.current.content.cgv.content).toBe(defaultContent.cgv.content);
  });

  it('should handle undefined content by using default content', () => {
    const { result } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} content={undefined} />,
    });

    expect(result.current.content).toEqual(defaultContent);
  });

  it('should expose config via getSDKPaymentOptions', () => {
    render(
      <SDKConfigProvider {...defaultProps} action={Action.PAYMENT_RESA}>
        <div>Test</div>
      </SDKConfigProvider>,
    );

    const options = getSDKPaymentOptions();

    expect(options.url).toBe(defaultProps.url);
    expect(options.action).toBe(Action.PAYMENT_RESA);
  });

  it('should handle all action types correctly', () => {
    const { result: resaResult } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} action={Action.PAYMENT_RESA} />,
    });
    expect(resaResult.current.action).toBe(Action.PAYMENT_RESA);

    const { result: soldeResult } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} action={Action.PAYMENT_SOLDE} />,
    });
    expect(soldeResult.current.action).toBe(Action.PAYMENT_SOLDE);
  });

  it('should update ref value when provider is rendered', () => {
    const testProps = {
      ...defaultProps,
      proposalId: 'new-proposal-123',
      action: Action.PAYMENT_RESA,
    };

    render(
      <SDKConfigProvider {...testProps}>
        <div>Test</div>
      </SDKConfigProvider>,
    );

    const options = getSDKPaymentOptions();
    expect(options.proposalId).toBe('new-proposal-123');
    expect(options.action).toBe(Action.PAYMENT_RESA);
  });

  it('should handle empty content object by merging with defaults', () => {
    const { result } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} content={{}} />,
    });

    expect(result.current.content).toEqual(defaultContent);
  });

  it('should prioritize bookingId over proposalId for action selection', () => {
    const { result } = renderHook(() => useSDKConfig(), {
      wrapper: (props) => <Wrapper {...props} bookingId="booking-789" proposalId="prop-456" />,
    });

    expect(result.current.action).toBe(Action.PAYMENT_SOLDE);
    expect(result.current.bookingId).toBe('booking-789');
  });
});
