import { act, renderHook, waitFor } from '@testing-library/react';

import type { CardEvents, HipayInputChangeData, HipayInstance } from '../types/Hipay.js';
import { defaultContent } from '../../../content/default.js';
import * as useCapsConfigContext from '../../../hooks/utils/useCapsConfigContext.js';
import * as useFormContext from '../../../hooks/utils/useForm.js';
import * as usePaymentProviderSettings from '../../../hooks/utils/usePaymentProviderSettings.js';
import * as useScriptLoader from '../../../hooks/utils/useScriptLoader.js';
import * as hipayHelpers from './hipay.js';
import { useHipayHostedFields } from './useHipayHostedFields.js';

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

  const { placeholders, validation } = defaultContent.creditCardForm;

  let mockSetValue: ReturnType<typeof vi.fn>;
  let mockFormState: { isSubmitting: boolean; submitCount: number };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSetValue = vi.fn();
    mockFormState = { isSubmitting: false, submitCount: 0 };

    vi.spyOn(useCapsConfigContext, 'useCapsConfigContext').mockReturnValue({
      content: defaultContent,
    } as any);

    vi.spyOn(useFormContext, 'useFormContext').mockReturnValue({
      formState: mockFormState,
      setValue: mockSetValue,
      control: {} as any,
    } as any);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: false,
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
              placeholder: placeholders.cardHolder,
              selector: mockFieldSelectors.cardHolder,
            },
            cardNumber: {
              placeholder: placeholders.cardNumber,
              selector: mockFieldSelectors.cardNumber,
            },
            cvc: {
              placeholder: placeholders.cvc,
              selector: mockFieldSelectors.cvc,
            },
            expiryDate: {
              placeholder: placeholders.expiryDate,
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

  const validity = (overrides: Partial<HipayInputChangeData['validity']>) => ({
    valid: false,
    empty: false,
    potentiallyValid: false,
    disabled: false,
    focused: true,
    ...overrides,
  });

  const renderWithEvents = () => {
    let events: CardEvents = {};

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      if (params.type === 'card') {
        events = params.events ?? {};
      }
      return mockHipayInstance;
    });
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({ isLoaded: true });

    const hook = renderHook(() => useHipayHostedFields({ fieldSelectors: mockFieldSelectors }));

    return { ...hook, events: () => events };
  };

  it('keeps an incorrect field neutral while typing and shows its error on blur', async () => {
    const { result, events } = renderWithEvents();

    await act(async () => {
      events().focus?.({ element: 'cardNumber' });
      events().inputChange?.({
        element: 'cardNumber',
        validity: validity({ error: 'Invalid card number' }),
        valid: false,
      });
    });

    expect(result.current.fields.cardNumber).toEqual({
      status: 'default',
      focused: true,
      filled: true,
      error: undefined,
    });

    await act(async () => {
      events().blur?.({ element: 'cardNumber' });
    });

    expect(result.current.fields.cardNumber).toMatchObject({
      status: 'error',
      focused: false,
      error: 'Invalid card number',
    });
  });

  it('turns a field green as soon as it is valid and tracks its focus', async () => {
    const { result, events } = renderWithEvents();

    await act(async () => {
      events().focus?.({ element: 'cvc' });
    });

    expect(result.current.fields.cvc.focused).toBe(true);

    await act(async () => {
      events().inputChange?.({
        element: 'cvc',
        validity: validity({ valid: true }),
        valid: true,
      });
    });

    expect(result.current.fields.cvc).toMatchObject({ status: 'success', focused: true });
  });

  it('shows the required message of empty fields once the form is submitted', async () => {
    const { result, rerender } = renderWithEvents();

    mockFormState.submitCount = 1;
    rerender();

    expect(result.current.fields.cardNumber).toMatchObject({
      status: 'error',
      error: validation.cardNumberRequired,
    });
    expect(result.current.fields.expiryDate.error).toBe(validation.expiryDate);
  });

  it('should generate token when form becomes valid via change event', async () => {
    let changeCallback: CardEvents['change'];

    const mockToken = 'test-token-123';
    mockHipayInstance.getPaymentData = vi.fn().mockResolvedValue({ token: mockToken });

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      if (params.type === 'card') {
        changeCallback = params.events?.change;
      }
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    renderHook(() => useHipayHostedFields({ fieldSelectors: mockFieldSelectors }));

    await act(async () => {
      changeCallback?.({ valid: true, errors: [] });
      await vi.waitFor(() => expect(mockSetValue).toHaveBeenCalled());
    });

    expect(mockSetValue).toHaveBeenCalledWith('token.status', 'pending');
    expect(mockSetValue).toHaveBeenCalledWith('token', {
      value: mockToken,
      status: 'success',
    });
  });

  it('should handle token generation error', async () => {
    let changeCallback: CardEvents['change'];

    const mockErrors = [{ field: 'cardNumber', message: 'Card expired' }];
    mockHipayInstance.getPaymentData = vi.fn().mockRejectedValue(mockErrors);

    vi.spyOn(hipayHelpers, 'mapHipayErrorsToObject').mockReturnValue({
      cardNumber: 'Card expired',
    });

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      if (params.type === 'card') {
        changeCallback = params.events?.change;
      }
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    const { result } = renderHook(() =>
      useHipayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await act(async () => {
      changeCallback?.({ valid: true, errors: [] });
      await vi.waitFor(() => expect(mockSetValue).toHaveBeenCalledTimes(2));
    });

    expect(mockSetValue).toHaveBeenCalledWith('token.status', 'pending');
    expect(mockSetValue).toHaveBeenCalledWith('token', {
      value: '',
      status: 'error',
    });
    expect(result.current.fields.cardNumber).toMatchObject({
      status: 'error',
      error: 'Card expired',
    });
  });

  it('should clear token when form becomes invalid', async () => {
    let changeCallback: CardEvents['change'];

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      if (params.type === 'card') {
        changeCallback = params.events?.change;
      }
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    renderHook(() => useHipayHostedFields({ fieldSelectors: mockFieldSelectors }));

    await act(async () => {
      changeCallback?.({ valid: false, errors: [] });
    });

    expect(mockSetValue).toHaveBeenCalledWith('token.value', '');
  });

  it('should generate token when form is submitted without token', async () => {
    const mockToken = 'submit-token-456';
    mockHipayInstance.getPaymentData = vi.fn().mockResolvedValue({ token: mockToken });

    vi.spyOn(hipayHelpers, 'createHipayClient').mockReturnValue(mockHipayInstance);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    const { rerender } = renderHook(() =>
      useHipayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

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
    let changeCallback: CardEvents['change'];
    let inputChangeCallback: ((data: HipayInputChangeData) => void) | undefined;

    let resolveToken: ((value: { token: string }) => void) | undefined;
    const tokenPromise = new Promise<{ token: string }>((resolve) => {
      resolveToken = resolve;
    });

    mockHipayInstance.getPaymentData = vi.fn().mockReturnValue(tokenPromise);

    vi.spyOn(hipayHelpers, 'createHipayClient').mockImplementation((params) => {
      if (params.type === 'card') {
        changeCallback = params.events?.change;
        inputChangeCallback = params.events?.inputChange;
      }
      return mockHipayInstance;
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    renderHook(() => useHipayHostedFields({ fieldSelectors: mockFieldSelectors }));

    await act(async () => {
      changeCallback?.({ valid: true, errors: [] });
    });

    expect(mockSetValue).toHaveBeenCalledWith('token.status', 'pending');

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

    await act(async () => {
      resolveToken?.({ token: 'old-token-should-be-ignored' });
    });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('token.status', 'idle');
    });

    const setValueCalls = mockSetValue.mock.calls;
    const tokenSetCalls = setValueCalls.filter(
      (call) => call[0] === 'token' && typeof call[1] === 'object',
    );
    expect(tokenSetCalls).toHaveLength(0);
  });
});
