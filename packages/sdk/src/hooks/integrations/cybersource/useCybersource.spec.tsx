import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import * as apiGenerated from '../../../__generated__';
import type { CybersourceMicroform } from '../../../types/Cybersource';
import * as useCapsConfigContext from '../../utils/useCapsConfigContext';
import * as useFormContext from '../../utils/useForm';
import * as useScriptLoader from '../../utils/useScriptLoader';
import * as cybersourceHelpers from './cybersource';
import { useCybersource } from './useCybersource';

vi.mock('../../../utils/decodeJwt', () => ({
  decodeJwt: vi.fn(() => ({
    ctx: [
      {
        data: {
          clientLibrary:
            'https://testflex.cybersource.com/microform/bundle/v2/flex-microform.min.js',
          clientLibraryIntegrity: 'sha384-test',
        },
      },
    ],
  })),
}));

describe('useCybersource', () => {
  let queryClient: QueryClient;

  const mockMicroform: CybersourceMicroform = {
    createField: vi.fn(() => {
      const onMock = vi.fn((event, callback) => {
        if (event === 'load' && callback) {
          callback();
        }
      });
      return {
        load: vi.fn(),
        on: onMock,
      };
    }),
    createToken: vi.fn(),
  };

  const mockFields = {
    cardNumber: {
      selector: 'cybersource-card-number',
      placeholder: 'Numéro de carte',
    },
    cvc: {
      selector: 'cybersource-card-cvc',
      placeholder: 'CVV',
    },
  };

  const mockContent = {
    creditCardForm: {
      title: 'Carte bancaire',
      cardNumber: 'Numéro de carte',
      fullName: 'Nom complet',
      expiryDate: "Date d'expiration",
      cvc: 'CVV',
    },
  };

  let mockSetValue: ReturnType<typeof vi.fn>;
  let mockFormState: { isSubmitting: boolean; errors: any };

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();

    mockSetValue = vi.fn();
    mockFormState = { isSubmitting: false, errors: {} };

    vi.spyOn(useCapsConfigContext, 'useCapsConfigContext').mockReturnValue({
      content: mockContent as any,
      id: 'booking123',
      type: 'booking',
    } as any);

    vi.spyOn(useFormContext, 'useFormContext').mockImplementation(
      () =>
        ({
          formState: mockFormState,
          setValue: mockSetValue,
          control: {} as any,
        }) as any,
    );

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: false,
    });

    vi.spyOn(cybersourceHelpers, 'createCybersourceMicroform').mockReturnValue(mockMicroform);

    vi.spyOn(apiGenerated, 'postV0PaymentProvidersProviderIdRequestToken').mockResolvedValue({
      format: 'JWT',
      token: 'mock-jwt-token',
    });
  });

  it('should fetch token on mount and initialize CyberSource SDK when script loads', async () => {
    vi.spyOn(useFormContext, 'useWatch').mockImplementation((name) =>
      name === 'creditCard.expiryDate' ? '2025-12-31' : undefined,
    );

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    const { result } = renderHook(() => useCybersource({ fields: mockFields }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(apiGenerated.postV0PaymentProvidersProviderIdRequestToken).toHaveBeenCalledWith(
        'MCYBERSOURCE',
        {
          params: {
            target_origins: window.location.origin,
            booking_id: 'booking123',
          },
        },
      );
    });

    await waitFor(() => {
      expect(cybersourceHelpers.createCybersourceMicroform).toHaveBeenCalledWith(
        'mock-jwt-token',
        mockFields,
      );
    });

    await waitFor(() => {
      expect(mockMicroform.createField).toHaveBeenCalledTimes(2);
      expect(result.current.isReady).toBe(true);
    });
  });

  it('should generate token when all fields are valid and expiry date is set', async () => {
    vi.spyOn(useFormContext, 'useWatch').mockImplementation((name) => {
      if (name === 'provider_id') return 'MCYBERSOURCE';
      if (name === 'creditCard.expiryDate') return '2025-12-31';
      return undefined;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    const { rerender } = renderHook(() => useCybersource({ fields: mockFields }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockMicroform.createField).toHaveBeenCalled();
    });

    const numberFieldOnChange = (mockMicroform.createField as any).mock.results[0].value.on.mock
      .calls[1][1];
    const securityCodeFieldOnChange = (mockMicroform.createField as any).mock.results[1].value.on
      .mock.calls[1][1];

    await act(async () => {
      numberFieldOnChange({ valid: true, empty: false });
    });

    await act(async () => {
      securityCodeFieldOnChange({ valid: true, empty: false });
    });

    await act(async () => {
      mockFormState.isSubmitting = true;
    });

    rerender();

    await waitFor(() => {
      expect(mockMicroform.createToken).toHaveBeenCalledWith(
        {
          expirationMonth: '12',
          expirationYear: '2025',
        },
        expect.any(Function),
      );
    });
  });

  it('should handle token generation errors', async () => {
    vi.spyOn(useFormContext, 'useWatch').mockImplementation((name) => {
      if (name === 'provider_id') return 'MCYBERSOURCE';
      if (name === 'creditCard.expiryDate') return '2025-12-31';
      return undefined;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    const { rerender } = renderHook(() => useCybersource({ fields: mockFields }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockMicroform.createField).toHaveBeenCalled();
    });

    const numberFieldOnChange = (mockMicroform.createField as any).mock.results[0].value.on.mock
      .calls[1][1];
    const securityCodeFieldOnChange = (mockMicroform.createField as any).mock.results[1].value.on
      .mock.calls[1][1];

    await act(async () => {
      numberFieldOnChange({ valid: true, empty: false });
      securityCodeFieldOnChange({ valid: true, empty: false });
    });

    await act(async () => {
      mockFormState.isSubmitting = true;
    });

    rerender();

    await waitFor(() => {
      expect(mockMicroform.createToken).toHaveBeenCalled();
    });

    const createTokenCallback = (mockMicroform.createToken as any).mock.calls[0][1];

    await act(async () => {
      createTokenCallback(new Error('Token generation failed'), null);
    });

    expect(mockSetValue).toHaveBeenCalledWith('token', { value: '', status: 'error' });
  });
});
