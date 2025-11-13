import { render, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { defaultContent } from '../content/default';
import { useCapsConfigContext, useOidcContext } from '../hooks/utils/useCapsConfigContext';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { CapsConfigProvider, getCapsConfig } from './CapsConfigProvider';

describe('CapsConfigProvider', () => {
  const defaultProps = {
    url: 'https://example.com',
    proposalId: 'prop-123',
    customerId: 'cust-456',
    locale: 'fr-FR',
    oidc: {
      issuerType: OidcIssuerTypes.GM,
      accessToken: '',
    },
    api: {
      url: 'https://api.example.com',
      apiKey: 'test-key',
    },
    callbackUrl: 'https://example.com/callback',
  };

  const Wrapper = ({ children, ...props }: PropsWithChildren<any>) => (
    <CapsConfigProvider {...defaultProps} {...props}>
      {children}
    </CapsConfigProvider>
  );

  it('should provide config context with proposal type', () => {
    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} />,
    });

    expect(result.current.url).toBe(defaultProps.url);
    expect(result.current.id).toBe(defaultProps.proposalId);
    expect(result.current.type).toBe('proposal');
    expect(result.current.locale).toBe(defaultProps.locale);
  });

  it('should provide config context with booking type', () => {
    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} proposalId={undefined} bookingId="booking-123" />,
    });

    expect(result.current.id).toBe('booking-123');
    expect(result.current.type).toBe('booking');
  });

  it('should prioritize bookingId over proposalId when both are provided', () => {
    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} proposalId="prop-999" bookingId="booking-123" />,
    });

    expect(result.current.id).toBe('booking-123');
    expect(result.current.type).toBe('booking');
  });

  it('should merge custom content with default content', () => {
    const customContent = {
      cgv: {
        title: 'Custom Terms',
      },
    } as any;

    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} content={customContent} />,
    });

    expect(result.current.content.cgv.title).toBe('Custom Terms');
    expect(result.current.content.cgv.content).toBe(defaultContent.cgv.content);
  });

  it('should handle undefined content by using default content', () => {
    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} content={undefined} />,
    });

    expect(result.current.content).toEqual(defaultContent);
  });

  it('should expose config via getCapsConfig', () => {
    render(
      <CapsConfigProvider {...defaultProps} proposalId="prop-123">
        <div>Test</div>
      </CapsConfigProvider>,
    );

    const config = getCapsConfig();

    expect(config.url).toBe(defaultProps.url);
    expect(config.id).toBe('prop-123');
    expect(config.type).toBe('proposal');
  });

  it('should update ref value when provider is rendered', () => {
    const testProps = {
      ...defaultProps,
      proposalId: 'new-proposal-123',
    };

    render(
      <CapsConfigProvider {...testProps}>
        <div>Test</div>
      </CapsConfigProvider>,
    );

    const config = getCapsConfig();
    expect(config.id).toBe('new-proposal-123');
    expect(config.type).toBe('proposal');
  });

  it('should handle empty content object by merging with defaults', () => {
    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} content={{}} />,
    });

    expect(result.current.content).toEqual(defaultContent);
  });

  it('should throw error when neither bookingId nor proposalId is provided', () => {
    expect(() => {
      render(
        <CapsConfigProvider {...defaultProps} bookingId={undefined} proposalId={undefined}>
          <div>Test</div>
        </CapsConfigProvider>,
      );
    }).toThrow('Either bookingId or proposalId must be provided');
  });

  it('should set type to proposal when only proposalId is provided', () => {
    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} proposalId="prop-999" bookingId={undefined} />,
    });

    expect(result.current.type).toBe('proposal');
    expect(result.current.id).toBe('prop-999');
  });

  it('should set type to booking when only bookingId is provided', () => {
    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} proposalId={undefined} bookingId="booking-456" />,
    });

    expect(result.current.type).toBe('booking');
    expect(result.current.id).toBe('booking-456');
  });

  it('should include customerId in config when provided', () => {
    const { result } = renderHook(() => useCapsConfigContext(), {
      wrapper: (props) => <Wrapper {...props} customerId="customer-789" />,
    });

    expect(result.current.customerId).toBe('customer-789');
  });

  it('should identify GO issuer as seller with useOidcContext', () => {
    const { result } = renderHook(() => useOidcContext(), {
      wrapper: (props) => (
        <Wrapper {...props} oidc={{ issuerType: OidcIssuerTypes.GO, accessToken: 'token' }} />
      ),
    });

    expect(result.current.isSeller).toBe(true);
  });

  it('should identify PARTNERS issuer as seller with useOidcContext', () => {
    const { result } = renderHook(() => useOidcContext(), {
      wrapper: (props) => (
        <Wrapper {...props} oidc={{ issuerType: OidcIssuerTypes.PARTNERS, accessToken: 'token' }} />
      ),
    });

    expect(result.current.isSeller).toBe(true);
  });

  it('should identify GM issuer as not seller with useOidcContext', () => {
    const { result } = renderHook(() => useOidcContext(), {
      wrapper: (props) => <Wrapper {...props} />,
    });

    expect(result.current.isSeller).toBe(false);
  });
});
