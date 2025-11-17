import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { useProfilePrefill } from './useProfilePrefill';

let mockProfile = {
  email: 'test@example.com',
  phones: [{ number: '+33612345678' }],
};

let mockIsSeller = true;

export const mockSetValue = vi.fn();

vi.mock('./utils/useCapsConfigContext', () => ({
  useCapsConfigContext: () => ({
    customerId: '87654321',
  }),
  useOidcContext: () => ({
    isSeller: mockIsSeller,
  }),
}));

vi.mock('./utils/useForm', () => ({
  useFormContext: () => ({
    setValue: mockSetValue,
  }),
}));

vi.mock('./data/useProfile', () => ({
  profileQueryOptions: (customerId: string) => ({
    queryKey: ['profile', customerId],
    queryFn: () => Promise.resolve(mockProfile),
    retry: false,
  }),
}));

describe('useProfilePrefill', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    mockIsSeller = true;
    mockProfile = {
      email: 'test@example.com',
      phones: [{ number: '+33612345678' }],
    };

    mockSetValue.mockClear();
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call setValue with email and mobile_phone', async () => {
    renderHook(() => useProfilePrefill(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('billing_details.email', 'test@example.com');

      expect(mockSetValue).toHaveBeenCalledWith('billing_details.mobile_phone', '+33612345678');
    });
  });

  it('should not set mobile_phone if profile has no phones', async () => {
    mockProfile = { email: 'test@example.com', phones: [] };

    renderHook(() => useProfilePrefill(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('billing_details.email', 'test@example.com');
      expect(mockSetValue).not.toHaveBeenCalledWith(
        'billing_details.mobile_phone',
        expect.anything(),
      );
    });
  });

  it('should not prefill when isSeller is false', async () => {
    mockIsSeller = false;

    renderHook(() => useProfilePrefill(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(mockSetValue).not.toHaveBeenCalled();
    });
  });

  it('should handle missing email', async () => {
    mockProfile = { phones: [{ number: '+33612345678' }] } as any;

    renderHook(() => useProfilePrefill(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('billing_details.mobile_phone', '+33612345678');
      expect(mockSetValue).not.toHaveBeenCalledWith('billing_details.email', expect.anything());
    });
  });
});
