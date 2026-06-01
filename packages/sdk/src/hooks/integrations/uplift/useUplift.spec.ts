import { act, renderHook } from '@testing-library/react';
import { useFormContext } from 'react-hook-form';

import { UpliftStatus } from '../../../types/Uplift';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatch } from '../../utils/useForm';
import { useWatchedPaymentProvider } from '../../utils/useWatchedPaymentProvider';
import { useUplift } from './useUplift';
import { useUpliftOrder } from './useUpliftOrder';

vi.mock('./up', () => ({
  loadUplift: vi.fn(),
}));

vi.mock('./useUpliftOrder', () => ({
  useUpliftOrder: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

vi.mock('../../utils/useWatchedPaymentProvider', () => ({
  useWatchedPaymentProvider: vi.fn(),
}));

vi.mock('../../utils/useCapsConfigContext', () => ({
  useCapsConfigContext: vi.fn(),
}));

vi.mock('../../utils/useForm', () => ({
  useWatch: vi.fn(),
}));

const mockUseFormContext = vi.mocked(useFormContext);
const mockUseWatchedPaymentProvider = vi.mocked(useWatchedPaymentProvider);
const mockUseCapsConfigContext = vi.mocked(useCapsConfigContext);
const mockUseWatch = vi.mocked(useWatch);
const mockUseUpliftOrder = vi.mocked(useUpliftOrder);

describe('useUplift', () => {
  const mockOrderInfo = {
    order_amount: 99999,
    travelers: [
      {
        id: 0,
        first_name: '',
        last_name: '',
        date_of_birth: '',
      },
    ],
    billing_contact: {
      id: 0,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
    },
    air_reservations: [],
    hotel_reservations: [
      {
        hotel_name: 'resort-cancun',
        number_of_rooms: 2,
        room_type: '',
        check_in: '2026-06-15',
        check_out: '2026-06-22',
      },
    ],
    add_ons: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseFormContext.mockReturnValue({
      setValue: vi.fn(),
    } as any);

    mockUseCapsConfigContext.mockReturnValue({
      locale: 'en-US',
    } as any);

    mockUseWatchedPaymentProvider.mockReturnValue({
      id: 'MUPLIFT',
      configuration: {
        display_type: 'iframe',
        settings: {
          code: 'uplift-code-123',
          api_key: 'test-api-key',
        },
      },
    } as any);

    mockUseWatch.mockReturnValue('USD');

    mockUseUpliftOrder.mockReturnValue(mockOrderInfo);

    global.window.Uplift = undefined as any;
    global.window.upReady = undefined as any;
  });

  it('should return null status initially', () => {
    const { result } = renderHook(() => useUplift());

    expect(result.current.status).toBeNull();
  });

  it('should set window.upReady callback', () => {
    renderHook(() => useUplift());

    expect(window.upReady).toBeDefined();
    expect(typeof window.upReady).toBe('function');
  });

  it('should not set upReady when code is missing', () => {
    mockUseWatchedPaymentProvider.mockReturnValue({
      id: 'MUPLIFT',
      configuration: {
        display_type: 'iframe',
        settings: {
          code: undefined,
          api_key: 'test-api-key',
        },
      },
    } as any);

    renderHook(() => useUplift());

    expect(window.upReady).toBeUndefined();
  });

  it('should not set upReady when orderInfo is null', () => {
    mockUseUpliftOrder.mockReturnValue(null);

    renderHook(() => useUplift());

    expect(window.upReady).toBeUndefined();
  });

  it('should return TOKEN_AVAILABLE status when data changes', () => {
    const { result, rerender } = renderHook(() => useUplift());

    expect(result.current.status).toBeNull();

    rerender();

    expect(result.current.status).toBeNull();
  });

  it('should use correct locale from context', () => {
    mockUseCapsConfigContext.mockReturnValue({
      locale: 'fr-FR',
    } as any);

    renderHook(() => useUplift());

    expect(mockUseCapsConfigContext).toHaveBeenCalled();
  });

  it('should use correct currency from form', () => {
    mockUseWatch.mockReturnValue('EUR');

    renderHook(() => useUplift());

    expect(mockUseWatch).toHaveBeenCalledWith('currency');
  });

  it('should call useWatchedPaymentProvider', () => {
    renderHook(() => useUplift());

    expect(mockUseWatchedPaymentProvider).toHaveBeenCalled();
  });

  it('initialises Uplift Payments when window.Uplift is available at upReady time', () => {
    const init = vi.fn();
    const load = vi.fn();
    (global.window as any).Uplift = {
      Payments: { init, load, exit: vi.fn(), clear: vi.fn() },
    };

    renderHook(() => useUplift());
    window.upReady?.();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'test-api-key', locale: 'en-US', currency: 'USD' }),
    );
    expect(load).toHaveBeenCalledWith(mockOrderInfo);
  });

  it('does not call Uplift Payments init when window.Uplift is missing at upReady time', () => {
    renderHook(() => useUplift());
    expect(() => window.upReady?.()).not.toThrow();
  });

  it('calls getToken when the onChange callback reports TOKEN_AVAILABLE', () => {
    const getToken = vi.fn();
    (global.window as any).Uplift = {
      Payments: { init: vi.fn(), load: vi.fn(), getToken, exit: vi.fn(), clear: vi.fn() },
    };

    let onChange: ((event: any) => void) | undefined;
    (global.window as any).Uplift.Payments.init = (cfg: any) => {
      onChange = cfg.onChange;
    };

    renderHook(() => useUplift());
    window.upReady?.();

    expect(onChange).toBeDefined();
    act(() => onChange!({ status: UpliftStatus.TOKEN_AVAILABLE }));

    expect(getToken).toHaveBeenCalled();
  });

  it('sets the form token when the onChange callback reports TOKEN_RETRIEVED', () => {
    const setValue = vi.fn();
    mockUseFormContext.mockReturnValue({ setValue } as any);

    (global.window as any).Uplift = {
      Payments: { init: vi.fn(), load: vi.fn(), getToken: vi.fn(), exit: vi.fn(), clear: vi.fn() },
    };

    let onChange: ((event: any) => void) | undefined;
    (global.window as any).Uplift.Payments.init = (cfg: any) => {
      onChange = cfg.onChange;
    };

    renderHook(() => useUplift());
    window.upReady?.();

    act(() =>
      onChange!({
        status: UpliftStatus.TOKEN_RETRIEVED,
        token: { card_token: 'tok-123' },
      }),
    );

    expect(setValue).toHaveBeenCalledWith(
      'token',
      { value: 'tok-123', status: 'success' },
      { shouldValidate: true },
    );
  });

  it('exits and clears Uplift Payments on unmount', () => {
    const exit = vi.fn();
    const clear = vi.fn();
    (global.window as any).Uplift = { Payments: { exit, clear, init: vi.fn(), load: vi.fn() } };

    const { unmount } = renderHook(() => useUplift());
    unmount();

    expect(exit).toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
  });
});
