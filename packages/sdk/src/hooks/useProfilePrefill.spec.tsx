import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { CapsFormData } from '../types/FormData';
import { useProfilePrefill } from './useProfilePrefill';

let mockProfile = {
  email: 'test@example.com',
  phones: [{ number: '+33612345678' }],
};

let mockIsSeller = true;
let mockCustomerId = '123';

vi.mock('./utils/useCapsConfigContext', () => ({
  useCapsConfigContext: () => ({
    customerId: mockCustomerId,
  }),
  useOidcContext: () => ({
    isSeller: mockIsSeller,
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
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockIsSeller = true;
    mockProfile = {
      email: 'test@example.com',
      phones: [{ number: '+33612345678' }],
    };
    vi.clearAllMocks();
  });

  const Wrapper = ({ children }: PropsWithChildren) => {
    const methods = useForm<CapsFormData>({
      defaultValues: {
        billing_details: {},
      } as CapsFormData,
    });

    return (
      <QueryClientProvider client={queryClient}>
        <FormProvider {...methods}>{children}</FormProvider>
      </QueryClientProvider>
    );
  };

  it('should prefill email and mobile_phone from profile', async () => {
    const { result } = renderHook(
      () => {
        const methods = useForm<CapsFormData>({
          defaultValues: {
            billing_details: {},
          } as CapsFormData,
        });
        useProfilePrefill();
        return methods;
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      const values = result.current.getValues();
      expect(values.billing_details?.email).toBe('test@example.com');
      expect(values.billing_details?.mobile_phone).toBe('+33612345678');
    });
  });

  it('should handle profile with missing phone number', async () => {
    mockProfile = {
      email: 'test@example.com',
      phones: [],
    };

    const { result } = renderHook(
      () => {
        const methods = useForm<CapsFormData>({
          defaultValues: {
            billing_details: {},
          } as CapsFormData,
        });
        useProfilePrefill();
        return methods;
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      const values = result.current.getValues();
      expect(values.billing_details?.email).toBe('test@example.com');
      expect(values.billing_details?.mobile_phone).toBeUndefined();
    });
  });

  it('should handle profile with undefined phones', async () => {
    mockProfile = {
      email: 'test@example.com',
    } as any;

    const { result } = renderHook(
      () => {
        const methods = useForm<CapsFormData>({
          defaultValues: {
            billing_details: {},
          } as CapsFormData,
        });
        useProfilePrefill();
        return methods;
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      const values = result.current.getValues();
      expect(values.billing_details?.email).toBe('test@example.com');
      expect(values.billing_details?.mobile_phone).toBeUndefined();
    });
  });

  it('should not prefill when isSeller is false', async () => {
    mockIsSeller = false;

    const { result } = renderHook(
      () => {
        const methods = useForm<CapsFormData>({
          defaultValues: {
            billing_details: {},
          } as CapsFormData,
        });
        useProfilePrefill();
        return methods;
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      const values = result.current.getValues();
      expect(values.billing_details?.email).toBeUndefined();
      expect(values.billing_details?.mobile_phone).toBeUndefined();
    });
  });

  it('should handle profile with missing email', async () => {
    mockProfile = {
      phones: [{ number: '+33612345678' }],
    } as any;

    const { result } = renderHook(
      () => {
        const methods = useForm<CapsFormData>({
          defaultValues: {
            billing_details: {},
          } as CapsFormData,
        });
        useProfilePrefill();
        return methods;
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      const values = result.current.getValues();
      expect(values.billing_details?.email).toBeUndefined();
      expect(values.billing_details?.mobile_phone).toBe('+33612345678');
    });
  });
});
