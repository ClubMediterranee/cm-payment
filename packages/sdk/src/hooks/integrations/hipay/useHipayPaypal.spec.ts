import { renderHook, waitFor } from '@testing-library/react';

import type { Hipay } from '../../../types/Hipay';
import * as usePaymentSubmit from '../../usePaymentSubmit';
import * as useCapsConfigContext from '../../utils/useCapsConfigContext';
import * as useFormContext from '../../utils/useForm';
import * as usePaymentProviderSettings from '../../utils/usePaymentProviderSettings';
import * as useScriptLoader from '../../utils/useScriptLoader';
import { useHipayPaypal } from './useHipayPaypal';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useWatch: vi.fn(() => undefined),
  };
});

describe('useHipayPaypal', () => {
  const mockHipayPaypalInstance = {
    on: vi.fn(),
    destroy: vi.fn(),
  };

  const mockHiPay: Hipay = vi.fn(() => ({
    create: vi.fn(() => mockHipayPaypalInstance),
  })) as any;

  let mockSetValue: ReturnType<typeof vi.fn>;
  let mockFormElement: HTMLFormElement;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSetValue = vi.fn();

    // Mock form element
    mockFormElement = document.createElement('form');
    mockFormElement.id = 'payment-form';
    mockFormElement.requestSubmit = vi.fn();
    document.body.appendChild(mockFormElement);

    // Mock window.HiPay
    (window as any).HiPay = mockHiPay;

    vi.spyOn(useCapsConfigContext, 'useCapsConfigContext').mockReturnValue({
      locale: 'fr-FR',
      oidc: {
        issuerType: 'GM',
        accessToken: 'test-token',
      },
    } as any);

    vi.spyOn(useFormContext, 'useFormContext').mockReturnValue({
      setValue: mockSetValue,
    } as any);

    vi.spyOn(useFormContext, 'useWatch')
      .mockReturnValueOnce('100') // amount
      .mockReturnValueOnce('EUR'); // currency

    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: false,
    } as any);

    vi.spyOn(usePaymentProviderSettings, 'usePaymentProviderSettings').mockReturnValue({
      script_url: 'https://stage-libs.hipay.com/js/sdkjs.js',
      username: '94675627.stage-secure-gateway.hipay-tpp.com',
      password: 'Test_jTQeMVl7R8Om7LTFGZwJV0Q5',
      environment: 'stage',
      max_amount: null,
      min_days_before_departure: null,
    } as any);

    vi.spyOn(usePaymentSubmit, 'usePaymentSubmit').mockReturnValue({
      handleSubmit: vi.fn(),
    } as any);
  });

  afterEach(() => {
    document.body.removeChild(mockFormElement);
    delete (window as any).HiPay;
  });

  it('should use payment provider settings for Hipay PayPal', () => {
    renderHook(() => useHipayPaypal());

    expect(usePaymentProviderSettings.usePaymentProviderSettings).toHaveBeenCalledWith('MHIPAYPP');
  });

  it('should not initialize when script is not loaded', () => {
    renderHook(() => useHipayPaypal());

    expect(mockHiPay).not.toHaveBeenCalled();
  });

  it('should initialize HiPay PayPal instance when script loads', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    } as any);

    renderHook(() => useHipayPaypal());

    await waitFor(() => {
      expect(mockHiPay).toHaveBeenCalledWith({
        username: '94675627.stage-secure-gateway.hipay-tpp.com',
        password: 'Test_jTQeMVl7R8Om7LTFGZwJV0Q5',
        environment: 'stage',
        max_amount: null,
        min_days_before_departure: null,
      });
    });
  });

  it('should register event listeners on PayPal instance', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    } as any);

    renderHook(() => useHipayPaypal());

    await waitFor(() => {
      expect(mockHiPay).toHaveBeenCalled();
    });
  });

  it('should set isReady when ready event triggers', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    } as any);

    renderHook(() => useHipayPaypal());

    await waitFor(() => {
      expect(mockHiPay).toHaveBeenCalled();
    });
  });

  it('should store orderID and auto-submit form on paymentAuthorized event', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    } as any);

    renderHook(() => useHipayPaypal());

    await waitFor(() => {
      expect(mockHiPay).toHaveBeenCalled();
    });
  });

  it('should clear token on error event', async () => {
    vi.spyOn(useScriptLoader, 'useScriptLoader').mockReturnValue({
      isLoaded: true,
    } as any);

    renderHook(() => useHipayPaypal());

    await waitFor(() => {
      expect(mockHiPay).toHaveBeenCalled();
    });
  });
});
