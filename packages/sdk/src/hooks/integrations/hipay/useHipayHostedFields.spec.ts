import { act, renderHook, waitFor } from '@testing-library/react';

import type { HipayInputChangeData, HipayInstance } from '../../../types/Hipay';
import * as usePaymentProviderSettings from '../../data/usePaymentConfig/usePaymentProviderSettings';
import * as useCapsConfigContext from '../../utils/useCapsConfigContext';
import * as useFormContext from '../../utils/useForm';
import * as useScriptLoader from '../../utils/useScriptLoader';
import * as hipayHelpers from './hipay';
import { useHipayHostedFields } from './useHipayHostedFields';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useWatch: vi.fn(() => undefined),
  };
});

describe('useHipayHostedFields', () => {
  const mockHipayInstance: HipayInstance = {
    on: vi.fn(),
    getPaymentData: vi.fn(),
    destroy: vi.fn(),
  };

  const mockFieldSelectors = {
    cardHolder: 'hipay-card-holder',
    cardNumber: 'hipay-card-number',
    expiryDate: 'hipay-card-expiry',
    cvc: 'hipay-card-cvc',
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
  let mockFormState: { isSubmitting: boolean };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSetValue = vi.fn();
    mockFormState = { isSubmitting: false };

    vi.spyOn(useCapsConfigContext, 'useCapsConfigContext').mockReturnValue({
      content: mockContent as any,
    } as any);

    vi.spyOn(useFormContext, 'useFormContext').mockReturnValue({
      formState: mockFormState,
      setValue: mockSetValue,
      control: {} as any,
    } as any);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: false,
      isLoading: false,
      error: null,
    });

    vi.spyOn(usePaymentProviderSettings, 'usePaymentProviderSettings').mockReturnValue({
      script_url: 'https://libs.hipay.com/js/sdkjs.js',
      username: 'test-username',
      password: 'test-password',
      environment: 'stage',
      max_amount: null,
      min_days_before_departure: null,
    } as any);

    vi.spyOn(hipayHelpers, 'createHipayClient').mockReturnValue(mockHipayInstance);
  });

  it('should initialize Hipay SDK when script loads and register event listeners', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useHipayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    expect(result.current.isReady).toBe(false);

    await waitFor(() => {
      expect(hipayHelpers.createHipayClient).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'card',
          config: {
            username: 'test-username',
            password: 'test-password',
            environment: 'stage',
            max_amount: null,
            min_days_before_departure: null,
          },
          options: {
            cardHolder: {
              placeholder: mockContent.creditCardForm.fullName,
              selector: mockFieldSelectors.cardHolder,
            },
            cardNumber: {
              placeholder: mockContent.creditCardForm.cardNumber,
              selector: mockFieldSelectors.cardNumber,
            },
            cvc: {
              placeholder: mockContent.creditCardForm.cvc,
              selector: mockFieldSelectors.cvc,
            },
            expiryDate: {
              placeholder: mockContent.creditCardForm.expiryDate,
              selector: mockFieldSelectors.expiryDate,
            },
          },
          events: expect.any(Object),
        }),
      );
    });
  });

  it('should set isReady when ready event triggers', async () => {
    let readyCallback: (() => void) | undefined;

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      readyCallback = params.events?.ready;
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useHipayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    expect(result.current.isReady).toBe(false);

    await act(async () => {
      readyCallback?.();
    });

    expect(result.current.isReady).toBe(true);
  });

  it('should update errors on inputChange event', async () => {
    let inputChangeCallback: ((data: HipayInputChangeData) => void) | undefined;

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      inputChangeCallback = params.events?.inputChange;
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useHipayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    const inputChangeData: HipayInputChangeData = {
      element: 'cardNumber',
      validity: {
        valid: false,
        empty: false,
        error: 'Invalid card number',
        potentiallyValid: false,
        disabled: false,
        focused: true,
      },
      valid: false,
    };

    await act(async () => {
      inputChangeCallback?.(inputChangeData);
    });

    expect(result.current.errors).toEqual({
      cardNumber: 'Invalid card number',
    });
  });

  it('should generate token when form becomes valid via change event', async () => {
    let changeCallback: ((data: { valid: boolean }) => void) | undefined;

    const mockToken = 'test-token-123';
    mockHipayInstance.getPaymentData = vi.fn().mockResolvedValue({ token: mockToken });

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      changeCallback = params.events?.change;
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    renderHook(() => useHipayHostedFields({ fieldSelectors: mockFieldSelectors }));

    await act(async () => {
      changeCallback?.({ valid: true });
      await vi.waitFor(() => expect(mockSetValue).toHaveBeenCalled());
    });

    expect(mockSetValue).toHaveBeenCalledWith('token.status', 'pending');
    expect(mockSetValue).toHaveBeenCalledWith('token', {
      value: mockToken,
      status: 'success',
    });
  });

  it('should handle token generation error', async () => {
    let changeCallback: ((data: { valid: boolean }) => void) | undefined;

    const mockErrors = [{ field: 'cardNumber', message: 'Card expired' }];
    mockHipayInstance.getPaymentData = vi.fn().mockRejectedValue(mockErrors);

    vi.spyOn(hipayHelpers, 'mapHipayErrorsToObject').mockReturnValue({
      cardNumber: 'Card expired',
    });

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      changeCallback = params.events?.change;
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useHipayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await act(async () => {
      changeCallback?.({ valid: true });
      await vi.waitFor(() => expect(mockSetValue).toHaveBeenCalledTimes(2));
    });

    expect(mockSetValue).toHaveBeenCalledWith('token.status', 'pending');
    expect(mockSetValue).toHaveBeenCalledWith('token', {
      value: '',
      status: 'error',
    });
    expect(result.current.errors).toEqual({
      cardNumber: 'Card expired',
    });
  });

  it('should clear token when form becomes invalid', async () => {
    let changeCallback: ((data: { valid: boolean }) => void) | undefined;

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      changeCallback = params.events?.change;
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    renderHook(() => useHipayHostedFields({ fieldSelectors: mockFieldSelectors }));

    await act(async () => {
      changeCallback?.({ valid: false });
    });

    expect(mockSetValue).toHaveBeenCalledWith('token.value', '');
  });

  it('should generate token when form is submitted without token', async () => {
    const mockToken = 'submit-token-456';
    mockHipayInstance.getPaymentData = vi.fn().mockResolvedValue({ token: mockToken });

    vi.spyOn(hipayHelpers, 'createHipayClient').mockReturnValue(mockHipayInstance);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { rerender } = renderHook(() =>
      useHipayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    // Simulate form submission
    mockFormState.isSubmitting = true;
    rerender();

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('token.status', 'pending');
    });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('token', {
        value: mockToken,
        status: 'success',
      });
    });
  });

  it('should cancel previous token generation if input changes', async () => {
    let changeCallback: ((data: { valid: boolean }) => void) | undefined;
    let inputChangeCallback: ((data: HipayInputChangeData) => void) | undefined;

    let resolveToken: ((value: { token: string }) => void) | undefined;
    const tokenPromise = new Promise<{ token: string }>((resolve) => {
      resolveToken = resolve;
    });

    mockHipayInstance.getPaymentData = vi.fn().mockReturnValue(tokenPromise);

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      changeCallback = params.events?.change;
      inputChangeCallback = params.events?.inputChange;
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    renderHook(() => useHipayHostedFields({ fieldSelectors: mockFieldSelectors }));

    // Start token generation
    await act(async () => {
      changeCallback?.({ valid: true });
    });

    expect(mockSetValue).toHaveBeenCalledWith('token.status', 'pending');

    // User changes input before first generation completes
    await act(async () => {
      inputChangeCallback?.({
        element: 'cardNumber',
        validity: {
          valid: true,
          empty: false,
          error: '',
          potentiallyValid: true,
          disabled: false,
          focused: true,
        },
        valid: true,
      });
    });

    // Complete the first token generation (should be ignored)
    await act(async () => {
      resolveToken?.({ token: 'old-token-should-be-ignored' });
    });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('token.status', 'idle');
    });

    // Verify the old token was not saved
    const setValueCalls = mockSetValue.mock.calls;
    const tokenSetCalls = setValueCalls.filter(
      (call) => call[0] === 'token' && typeof call[1] === 'object',
    );
    expect(tokenSetCalls).toHaveLength(0);
  });
});
