import { act, renderHook, waitFor } from '@testing-library/react';

import type { HipayInputChangeData, HipayInstance } from '../../../types/Hipay';
import * as useCapsConfigContext from '../../utils/useCapsConfigContext';
import * as useFormContext from '../../utils/useForm';
import * as useScriptLoader from '../../utils/useScriptLoader';
import * as hipayHelpers from './hipay';
import { useHipay } from './useHipay';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useWatch: vi.fn(() => undefined),
  };
});

describe('useHipay', () => {
  const mockHipayInstance: HipayInstance = {
    on: vi.fn(),
    getPaymentData: vi.fn(),
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

    vi.spyOn(hipayHelpers, 'createHipayHostedFields').mockReturnValue(mockHipayInstance);
  });

  it('should initialize Hipay SDK when script loads and register event listeners', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useHipay({ fieldSelectors: mockFieldSelectors }));

    expect(result.current.isReady).toBe(false);

    await waitFor(() => {
      expect(hipayHelpers.createHipayHostedFields).toHaveBeenCalledWith({
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
      });
      expect(mockHipayInstance.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockHipayInstance.on).toHaveBeenCalledWith('inputChange', expect.any(Function));
    });
  });

  it('should set isReady when ready event triggers', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useHipay({ fieldSelectors: mockFieldSelectors }));

    expect(result.current.isReady).toBe(false);

    const readyCallback = (mockHipayInstance.on as any).mock.calls.find(
      ([event]: [string, any]) => event === 'ready',
    )?.[1];

    await act(async () => {
      readyCallback?.();
    });

    expect(result.current.isReady).toBe(true);
  });

  it('should update errors on inputChange event', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useHipay({ fieldSelectors: mockFieldSelectors }));

    const inputChangeCallback = (mockHipayInstance.on as any).mock.calls.find(
      ([event]: [string, any]) => event === 'inputChange',
    )?.[1];

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
});
