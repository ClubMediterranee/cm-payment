import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { PspProviders } from '../types/PspProviders';
import { usePaymentConfirmation } from './usePaymentConfirmation';

const mockPaymentStatus = vi.fn();
const mockPaymentNotify = vi.fn();
const mockRedirectToCallback = vi.fn();

let mockSearchParams: Record<string, string> = {};

vi.mock('./data/usePaymentStatus', () => ({
  usePaymentStatus: (params: any) => mockPaymentStatus(params),
}));

vi.mock('./data/usePaymentNotify', () => ({
  usePaymentNotify: (params: any) => mockPaymentNotify(params),
}));

vi.mock('../utils/url/navigateToCallbackUrl', () => ({
  navigateToCallbackUrl: (params: any) => mockRedirectToCallback(params),
}));

const OriginalURLSearchParams = global.URLSearchParams;

class MockURLSearchParams extends OriginalURLSearchParams {
  constructor(init?: string | Record<string, string> | URLSearchParams) {
    if (typeof init === 'string' && init.startsWith('?')) {
      super(init);
    } else {
      super(mockSearchParams);
    }
  }

  get(key: string): string | null {
    return mockSearchParams[key] || null;
  }
}

global.URLSearchParams = MockURLSearchParams as any;

describe('usePaymentConfirmation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mockPaymentStatus.mockClear();
    mockPaymentNotify.mockClear();
    mockRedirectToCallback.mockClear();
    mockSearchParams = {};
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should enable correct hook based on provider in serverValidationProviders', () => {
    mockSearchParams = {
      provider_id: PspProviders.EVOXPAY,
      callback_url: 'https://example.com/callback',
    };

    mockPaymentStatus.mockReturnValue({ data: undefined });
    mockPaymentNotify.mockReturnValue({ data: undefined });

    renderHook(() => usePaymentConfirmation({ paymentId: 'payment-123' }), {
      wrapper: Wrapper,
    });

    expect(mockPaymentStatus).toHaveBeenCalledWith({
      paymentId: 'payment-123',
      enabled: true,
    });

    expect(mockPaymentNotify).toHaveBeenCalledWith({
      paymentId: 'payment-123',
      enabled: false,
    });
  });

  it('should enable usePaymentNotify for providers not in serverValidationProviders', () => {
    mockSearchParams = {
      provider_id: PspProviders.HIPAY,
      callback_url: 'https://example.com/callback',
    };

    mockPaymentStatus.mockReturnValue({ data: undefined });
    mockPaymentNotify.mockReturnValue({ data: undefined });

    renderHook(() => usePaymentConfirmation({ paymentId: 'payment-123' }), {
      wrapper: Wrapper,
    });

    expect(mockPaymentStatus).toHaveBeenCalledWith({
      paymentId: 'payment-123',
      enabled: false,
    });

    expect(mockPaymentNotify).toHaveBeenCalledWith({
      paymentId: 'payment-123',
      enabled: true,
    });
  });

  it('should redirect when payment status is not PENDING', async () => {
    mockSearchParams = {
      provider_id: 'EIXOPAY',
      callback_url: 'https://example.com/callback',
      proposal_id: 'prop-123',
    };

    const paymentStatusData = {
      payment_status: 'OK',
      booking_id: 'booking-456',
    };

    mockPaymentStatus.mockReturnValue({ data: paymentStatusData });
    mockPaymentNotify.mockReturnValue({ data: undefined });

    renderHook(() => usePaymentConfirmation({ paymentId: 'payment-123' }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockRedirectToCallback).toHaveBeenCalled();
    });

    expect(mockRedirectToCallback).toHaveBeenCalledWith({
      callbackUrl: 'https://example.com/callback',
      paymentResponse: paymentStatusData,
      proposalId: 'prop-123',
    });
  });

  it('should not redirect when payment status is PENDING', async () => {
    mockSearchParams = {
      provider_id: 'EIXOPAY',
      callback_url: 'https://example.com/callback',
    };

    const paymentStatusData = {
      payment_status: 'PENDING',
    };

    mockPaymentStatus.mockReturnValue({ data: paymentStatusData });
    mockPaymentNotify.mockReturnValue({ data: undefined });

    renderHook(() => usePaymentConfirmation({ paymentId: 'payment-123' }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockPaymentStatus).toHaveBeenCalled();
    });

    expect(mockRedirectToCallback).not.toHaveBeenCalled();
  });

  it('should not redirect when payment data is undefined', async () => {
    mockSearchParams = {
      provider_id: 'EIXOPAY',
      callback_url: 'https://example.com/callback',
    };

    mockPaymentStatus.mockReturnValue({ data: undefined });
    mockPaymentNotify.mockReturnValue({ data: undefined });

    renderHook(() => usePaymentConfirmation({ paymentId: 'payment-123' }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockPaymentStatus).toHaveBeenCalled();
    });

    expect(mockRedirectToCallback).not.toHaveBeenCalled();
  });
});
