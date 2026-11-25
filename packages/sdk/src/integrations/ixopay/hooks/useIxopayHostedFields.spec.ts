import { act, renderHook, waitFor } from '@testing-library/react';

import { defaultContent } from '../../../content/default.js';
import * as useCapsConfigContext from '../../../hooks/utils/useCapsConfigContext.js';
import * as useFormContext from '../../../hooks/utils/useForm.js';
import * as useScriptLoader from '../../../hooks/utils/useScriptLoader.js';
import * as useWatchedPaymentProvider from '../../../hooks/utils/useWatchedPaymentProvider.js';
import { IXOPAY_STYLE, useIxopayHostedFields } from './useIxopayHostedFields.js';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useWatch: vi.fn(() => undefined),
  };
});

const mockPaymentJsInit = vi.fn();
const mockPaymentJsTokenize = vi.fn();
const mockSetNumberStyle = vi.fn();
const mockSetCvvStyle = vi.fn();
const mockSetNumberPlaceholder = vi.fn();
const mockSetCvvPlaceholder = vi.fn();
const mockNumberOn = vi.fn();
const mockCvvOn = vi.fn();

(global as any).window.PaymentJs = vi.fn(function PaymentJs() {
  return {
    init: mockPaymentJsInit,
    tokenize: mockPaymentJsTokenize,
  };
});

describe('useIxopayHostedFields', () => {
  const mockFieldSelectors = {
    cardNumber: 'ixopay-card-number',
    cvc: 'ixopay-card-cvc',
  };

  let mockSetValue: ReturnType<typeof vi.fn>;
  let mockFormState: { isSubmitting: boolean; submitCount: number };
  let formContextSpy: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    mockSetValue = vi.fn();
    mockFormState = { isSubmitting: false, submitCount: 0 };

    vi.spyOn(useCapsConfigContext, 'useCapsConfigContext').mockReturnValue({
      content: defaultContent,
    } as any);

    formContextSpy = vi.spyOn(useFormContext, 'useFormContext');
    formContextSpy.mockReturnValue({
      formState: mockFormState,
      setValue: mockSetValue,
      control: {} as any,
    } as any);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: false,
    });

    vi.spyOn(useWatchedPaymentProvider, 'useWatchedPaymentProvider').mockReturnValue({
      id: 'EIXOPAY',
      configuration: {
        display_type: 'hosted_field',
        settings: {
          script_url: 'https://gateway.ixopay.com/js/integrated/payment.1.3.min.js',
          integration_key: 'test-integration-key',
          max_amount: null,
          min_days_before_departure: null,
        },
      },
    } as any);

    mockPaymentJsInit.mockReset();
    mockPaymentJsTokenize.mockReset();
    mockNumberOn.mockReset();
    mockCvvOn.mockReset();

    mockPaymentJsInit.mockImplementation(
      (_integrationKey, _cardNumberSelector, _cvcSelector, callback) => {
        const paymentObject = {
          setNumberStyle: mockSetNumberStyle,
          setCvvStyle: mockSetCvvStyle,
          setNumberPlaceholder: mockSetNumberPlaceholder,
          setCvvPlaceholder: mockSetCvvPlaceholder,
          numberOn: mockNumberOn,
          cvvOn: mockCvvOn,
        };
        callback(paymentObject);
      },
    );
  });

  it('should initialize Ixopay SDK when script loads', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    const { result } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(() => {
      expect(mockPaymentJsInit).toHaveBeenCalledWith(
        'test-integration-key',
        mockFieldSelectors.cardNumber,
        mockFieldSelectors.cvc,
        expect.any(Function),
      );
    });

    await waitFor(
      () => {
        expect(result.current.isReady).toBe(true);
      },
      { timeout: 500 },
    );
  });

  it('should not initialize Ixopay SDK when script is not loaded', () => {
    const { result } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    expect(result.current.isReady).toBe(false);
    expect(mockPaymentJsInit).not.toHaveBeenCalled();
  });

  const listenersOf = (on: ReturnType<typeof vi.fn>) => (event: string) =>
    on.mock.calls.find(([name]) => name === event)?.[1];

  const renderReady = async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({ isLoaded: true });

    const hook = renderHook(() => useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }));

    await waitFor(() => expect(hook.result.current.isReady).toBe(true));

    return { ...hook, number: listenersOf(mockNumberOn), cvv: listenersOf(mockCvvOn) };
  };

  it('styles both hosted fields and sets their placeholders', async () => {
    await renderReady();

    expect(mockSetNumberStyle).toHaveBeenCalledWith(IXOPAY_STYLE);
    expect(mockSetCvvStyle).toHaveBeenCalledWith(IXOPAY_STYLE);
    expect(mockSetNumberPlaceholder).toHaveBeenCalledWith(
      defaultContent.creditCardForm.placeholders.cardNumber,
    );
    expect(mockSetCvvPlaceholder).toHaveBeenCalledWith(
      defaultContent.creditCardForm.placeholders.cvc,
    );
  });

  it('keeps an incorrect card number neutral while typing and shows its error on blur', async () => {
    const { result, number } = await renderReady();

    await act(async () => {
      number('focus')({ validNumber: false, numberLength: 0 });
      number('input')({ validNumber: false, numberLength: 4 });
    });

    expect(result.current.fields.number).toEqual({
      status: 'default',
      focused: true,
      filled: true,
      error: undefined,
    });

    await act(async () => {
      number('blur')({ validNumber: false, numberLength: 4 });
    });

    expect(result.current.fields.number).toMatchObject({
      status: 'error',
      focused: false,
      error: defaultContent.creditCardForm.validation.cardNumber,
    });

    await act(async () => {
      number('input')({ validNumber: true, numberLength: 16 });
    });

    expect(result.current.fields.number.status).toBe('success');
  });

  it('tracks the cvv validity and focus', async () => {
    const { result, cvv } = await renderReady();

    await act(async () => {
      cvv('focus')({ validCvv: false, cvvLength: 0 });
    });

    expect(result.current.fields.cvv.focused).toBe(true);

    await act(async () => {
      cvv('input')({ validCvv: true, cvvLength: 3 });
      cvv('blur')({ validCvv: true, cvvLength: 3 });
    });

    expect(result.current.fields.cvv).toMatchObject({ status: 'success', focused: false });
  });

  it('should generate token on form submission when ready', async () => {
    const mockUseWatch = vi.fn();
    mockUseWatch.mockImplementation((field: string) => {
      if (field === 'token.value') return undefined;
      if (field === 'token.status') return 'idle';
      if (field === 'creditCard.expiryDate') return '2025 / 12';
      if (field === 'creditCard.cardHolder') return 'John Doe';
      return undefined;
    });

    vi.spyOn(useFormContext, 'useWatch').mockImplementation(mockUseWatch);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    mockPaymentJsTokenize.mockImplementation((_data, onSuccess) => {
      onSuccess('mock-token-123');
    });

    const { rerender } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(() => {
      expect(mockPaymentJsInit).toHaveBeenCalled();
    });

    formContextSpy.mockReturnValue({
      formState: { isSubmitting: true, submitCount: 0 },
      setValue: mockSetValue,
      control: {} as any,
    } as any);

    act(() => {
      rerender();
    });

    await waitFor(() => {
      expect(mockPaymentJsTokenize).toHaveBeenCalledWith(
        {
          card_holder: 'John Doe',
          month: '12',
          year: '2025',
        },
        expect.any(Function),
        expect.any(Function),
      );
    });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('token.status', 'pending');
      expect(mockSetValue).toHaveBeenCalledWith('token', {
        value: 'mock-token-123',
        status: 'success',
      });
    });
  });

  it('should handle tokenization errors', async () => {
    const mockUseWatch = vi.fn();
    mockUseWatch.mockImplementation((field: string) => {
      if (field === 'token.value') return undefined;
      if (field === 'token.status') return 'idle';
      if (field === 'creditCard.expiryDate') return '2025 / 12';
      if (field === 'creditCard.cardHolder') return 'John Doe';
      return undefined;
    });

    vi.spyOn(useFormContext, 'useWatch').mockImplementation(mockUseWatch);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    mockPaymentJsTokenize.mockImplementation((_data, _onSuccess, onError) => {
      onError([
        { attribute: 'number', message: 'Invalid card number' },
        { attribute: 'cvv', message: 'Invalid CVV' },
        { attribute: 'card_holder', message: 'Invalid card holder' },
      ]);
    });

    const { result, rerender } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    formContextSpy.mockReturnValue({
      formState: { isSubmitting: true, submitCount: 0 },
      setValue: mockSetValue,
      control: {} as any,
    } as any);

    act(() => {
      rerender();
    });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('token', {
        value: '',
        status: 'error',
      });
    });

    expect(result.current.fields.number.error).toBe('Invalid card number');
    expect(result.current.fields.cvv.error).toBe('Invalid CVV');
  });

  it('should not generate token if expiry date is missing', async () => {
    const mockUseWatch = vi.fn();
    mockUseWatch.mockImplementation((field: string) => {
      if (field === 'token.value') return undefined;
      if (field === 'token.status') return 'idle';
      if (field === 'creditCard.expiryDate') return undefined;
      if (field === 'creditCard.cardHolder') return 'John Doe';
      return undefined;
    });

    vi.spyOn(useFormContext, 'useWatch').mockImplementation(mockUseWatch);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    });

    mockPaymentJsTokenize.mockClear();

    const { rerender } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(() => {
      expect(mockPaymentJsInit).toHaveBeenCalled();
    });

    formContextSpy.mockReturnValue({
      formState: { isSubmitting: true, submitCount: 0 },
      setValue: mockSetValue,
      control: {} as any,
    } as any);

    act(() => {
      rerender();
    });

    await waitFor(() => {
      expect(mockPaymentJsInit).toHaveBeenCalled();
    });

    expect(mockPaymentJsTokenize).not.toHaveBeenCalled();
  });

  it('flags the token in error when the expiry date is malformed', async () => {
    vi.spyOn(useFormContext, 'useWatch').mockImplementation((field: string) => {
      if (field === 'creditCard.expiryDate') return '2025 / 1';
      if (field === 'creditCard.cardHolder') return 'John Doe';
      return undefined;
    });

    const { rerender } = await renderReady();

    formContextSpy.mockReturnValue({
      formState: { isSubmitting: true, submitCount: 0 },
      setValue: mockSetValue,
      control: {} as any,
    } as any);
    act(() => rerender());

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('token', { value: '', status: 'error' });
    });
    expect(mockPaymentJsTokenize).not.toHaveBeenCalled();
  });
});
