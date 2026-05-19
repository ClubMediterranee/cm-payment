import { act, renderHook, waitFor } from '@testing-library/react';

import type { IxopayPaymentJs } from '../../../types/Ixopay';
import * as useCapsConfigContext from '../../utils/useCapsConfigContext';
import * as useFormContext from '../../utils/useForm';
import * as useScriptLoader from '../../utils/useScriptLoader';
import * as useWatchedPaymentProvider from '../../utils/useWatchedPaymentProvider';
import { useIxopayHostedFields } from './useIxopayHostedFields';

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

(global as any).window.PaymentJs = vi.fn(function PaymentJsConstructor(this: any, version: string) {
  const self = this;
  self.init = mockPaymentJsInit;
  self.tokenize = mockPaymentJsTokenize;
  return self;
});

describe('useIxopayHostedFields', () => {
  const mockIxopayInstance: IxopayPaymentJs = {
    init: vi.fn(),
    tokenize: vi.fn(),
  };

  const mockFieldSelectors = {
    cardNumber: 'ixopay-card-number',
    cvc: 'ixopay-card-cvc',
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
  let formContextSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSetValue = vi.fn();
    mockFormState = { isSubmitting: false };

    vi.spyOn(useCapsConfigContext, 'useCapsConfigContext').mockReturnValue({
      content: mockContent as any,
    } as any);

    formContextSpy = vi.spyOn(useFormContext, 'useFormContext');
    formContextSpy.mockReturnValue({
      formState: mockFormState,
      setValue: mockSetValue,
      control: {} as any,
    } as any);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: false,
      isLoading: false,
      error: null,
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

    mockPaymentJsInit.mockClear();
    mockPaymentJsTokenize.mockClear();
    mockNumberOn.mockClear();
    mockCvvOn.mockClear();

    mockPaymentJsInit.mockImplementation(
      (integrationKey, cardNumberSelector, cvcSelector, callback) => {
        const paymentObject = {
          setNumberStyle: mockSetNumberStyle,
          setCvvStyle: mockSetCvvStyle,
          setNumberPlaceholder: mockSetNumberPlaceholder,
          setCvvPlaceholder: mockSetCvvPlaceholder,
          numberOn: mockNumberOn,
          cvvOn: mockCvvOn,
        };
        setTimeout(() => callback(paymentObject), 0);
      },
    );
  });

  it('should initialize Ixopay SDK when script loads', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    expect(result.current.isReady).toBe(false);

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

  it.skip('should update field errors on number input change', async () => {
    let onNumberInputCallback: (data: any) => void = () => {};

    mockNumberOn.mockImplementation((event, callback) => {
      if (event === 'input') {
        onNumberInputCallback = callback;
      }
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(
      () => {
        expect(result.current.isReady).toBe(true);
        expect(mockNumberOn).toHaveBeenCalledWith('input', expect.any(Function));
      },
      { timeout: 500 },
    );

    act(() => {
      onNumberInputCallback({ validNumber: false });
    });

    await waitFor(() => {
      expect(result.current.errors.number).toBeDefined();
    });

    act(() => {
      onNumberInputCallback({ validNumber: true });
    });

    await waitFor(() => {
      expect(result.current.errors.number).toBeUndefined();
    });
  });

  it.skip('should update field errors on cvv input change', async () => {
    let onCvvInputCallback: (data: any) => void = () => {};

    mockCvvOn.mockImplementation((event, callback) => {
      if (event === 'input') {
        onCvvInputCallback = callback;
      }
    });

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(
      () => {
        expect(result.current.isReady).toBe(true);
        expect(mockCvvOn).toHaveBeenCalledWith('input', expect.any(Function));
      },
      { timeout: 500 },
    );

    act(() => {
      onCvvInputCallback({ validCvv: false });
    });

    await waitFor(() => {
      expect(result.current.errors.cvv).toBeDefined();
    });

    act(() => {
      onCvvInputCallback({ validCvv: true });
    });

    await waitFor(() => {
      expect(result.current.errors.cvv).toBeUndefined();
    });
  });

  it.skip('should generate token on form submission when ready', async () => {
    const mockUseWatch = vi.fn();
    mockUseWatch.mockImplementation((field: string) => {
      if (field === 'token.value') return undefined;
      if (field === 'token.status') return 'idle';
      if (field === 'creditCard.expiryDate') return '2025-12-01';
      if (field === 'creditCard.cardHolder') return 'John Doe';
      return undefined;
    });

    vi.spyOn(require('react-hook-form'), 'useWatch').mockImplementation(mockUseWatch);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    mockPaymentJsTokenize.mockImplementation((data, onSuccess) => {
      onSuccess('mock-token-123');
    });

    const { rerender } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(() => {
      expect(mockPaymentJsInit).toHaveBeenCalled();
    });

    formContextSpy.mockReturnValue({
      formState: { isSubmitting: true },
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

  it.skip('should handle tokenization errors', async () => {
    const mockUseWatch = vi.fn();
    mockUseWatch.mockImplementation((field: string) => {
      if (field === 'token.value') return undefined;
      if (field === 'token.status') return 'idle';
      if (field === 'creditCard.expiryDate') return '2025-12-01';
      if (field === 'creditCard.cardHolder') return 'John Doe';
      return undefined;
    });

    vi.spyOn(require('react-hook-form'), 'useWatch').mockImplementation(mockUseWatch);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    mockPaymentJsTokenize.mockImplementation((data, onSuccess, onError) => {
      onError([
        { attribute: 'number', message: 'Invalid card number' },
        { attribute: 'cvv', message: 'Invalid CVV' },
      ]);
    });

    const { result, rerender } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    formContextSpy.mockReturnValue({
      formState: { isSubmitting: true },
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

    expect(result.current.errors.number).toBe('Invalid card number');
    expect(result.current.errors.cvv).toBe('Invalid CVV');
  });

  it.skip('should not generate token if expiry date is missing', async () => {
    const mockUseWatch = vi.fn();
    mockUseWatch.mockImplementation((field: string) => {
      if (field === 'token.value') return undefined;
      if (field === 'token.status') return 'idle';
      if (field === 'creditCard.expiryDate') return undefined;
      if (field === 'creditCard.cardHolder') return 'John Doe';
      return undefined;
    });

    vi.spyOn(require('react-hook-form'), 'useWatch').mockImplementation(mockUseWatch);

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    mockPaymentJsTokenize.mockClear();

    const { rerender } = renderHook(() =>
      useIxopayHostedFields({ fieldSelectors: mockFieldSelectors }),
    );

    await waitFor(() => {
      expect(mockPaymentJsInit).toHaveBeenCalled();
    });

    formContextSpy.mockReturnValue({
      formState: { isSubmitting: true },
      setValue: mockSetValue,
      control: {} as any,
    } as any);

    act(() => {
      rerender();
    });

    await waitFor(() => {
      expect(mockPaymentJsTokenize).not.toHaveBeenCalled();
      expect(mockSetValue).toHaveBeenCalledWith('token', {
        value: '',
        status: 'error',
      });
    });
  });
});
