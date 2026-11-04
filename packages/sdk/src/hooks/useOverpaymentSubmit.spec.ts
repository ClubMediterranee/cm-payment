import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';

import * as usePaymentScheduleModule from './data/usePaymentSchedule';
import { useOverpaymentSubmit } from './useOverpaymentSubmit';
import * as usePaymentSubmitModule from './usePaymentSubmit';
import * as useFormModule from './utils/useForm';

vi.mock('./utils/useProviderIntegrationMode');

describe('useOverpaymentSubmit', () => {
  let mockHandleSubmit: Mock;
  let mockWatch: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockHandleSubmit = vi.fn();
    mockWatch = vi.fn();

    vi.spyOn(usePaymentSubmitModule, 'usePaymentSubmit').mockReturnValue({
      handleSubmit: mockHandleSubmit,
      isPending: false,
      isError: false,
    } as any);

    vi.spyOn(usePaymentScheduleModule, 'usePaymentSchedule').mockReturnValue({
      paymentSchedule: [{ amount: 1000, currency: 'EUR' }],
    } as any);

    vi.spyOn(useFormModule, 'useFormContext').mockReturnValue({
      watch: mockWatch,
    } as any);
  });

  describe('onSubmit', () => {
    it('appelle handleSubmit directement si amount <= dueAmount', () => {
      mockWatch.mockReturnValue('500');
      const { result } = renderHook(() => useOverpaymentSubmit());
      const mockEvent = { preventDefault: vi.fn() } as any;

      act(() => result.current.onSubmit(mockEvent));

      expect(mockHandleSubmit).toHaveBeenCalledWith(mockEvent);
      expect(result.current.isConfirmOpen).toBe(false);
    });

    it('appelle handleSubmit directement si amount == dueAmount', () => {
      mockWatch.mockReturnValue('1000');
      const { result } = renderHook(() => useOverpaymentSubmit());
      const mockEvent = { preventDefault: vi.fn() } as any;

      act(() => result.current.onSubmit(mockEvent));

      expect(mockHandleSubmit).toHaveBeenCalledWith(mockEvent);
      expect(result.current.isConfirmOpen).toBe(false);
    });

    it('ouvre la modale si amount > dueAmount', () => {
      mockWatch.mockReturnValue('1500');
      const { result } = renderHook(() => useOverpaymentSubmit());
      const mockEvent = { preventDefault: vi.fn() } as any;

      act(() => result.current.onSubmit(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandleSubmit).not.toHaveBeenCalled();
      expect(result.current.isConfirmOpen).toBe(true);
    });
  });

  describe('onConfirm', () => {
    it("ferme la modale et appelle handleSubmit avec l'event en attente", () => {
      mockWatch.mockReturnValue('1500');
      const { result } = renderHook(() => useOverpaymentSubmit());
      const mockEvent = { preventDefault: vi.fn() } as any;

      act(() => result.current.onSubmit(mockEvent));
      expect(result.current.isConfirmOpen).toBe(true);

      act(() => result.current.onConfirm());

      expect(result.current.isConfirmOpen).toBe(false);
      expect(mockHandleSubmit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('onCancel', () => {
    it('ferme la modale sans soumettre', () => {
      mockWatch.mockReturnValue('1500');
      const { result } = renderHook(() => useOverpaymentSubmit());
      const mockEvent = { preventDefault: vi.fn() } as any;

      act(() => result.current.onSubmit(mockEvent));
      expect(result.current.isConfirmOpen).toBe(true);

      act(() => result.current.onCancel());

      expect(result.current.isConfirmOpen).toBe(false);
      expect(mockHandleSubmit).not.toHaveBeenCalled();
    });
  });

  it('expose isPending depuis usePaymentSubmit', () => {
    vi.spyOn(usePaymentSubmitModule, 'usePaymentSubmit').mockReturnValue({
      handleSubmit: mockHandleSubmit,
      isPending: true,
      isError: false,
    } as any);
    mockWatch.mockReturnValue('0');

    const { result } = renderHook(() => useOverpaymentSubmit());

    expect(result.current.isPending).toBe(true);
  });
});
