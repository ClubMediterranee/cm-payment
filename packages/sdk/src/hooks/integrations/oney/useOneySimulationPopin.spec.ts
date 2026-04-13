import { renderHook } from '@testing-library/react';

import { PspProviders } from '../../../types/PspProviders';
import { usePaymentProviderSettings } from '../../data/usePaymentConfig/usePaymentProviderSettings';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatch } from '../../utils/useForm';
import { useScriptLoader } from '../../utils/useScriptLoader';
import { getOneyPopinOptions, loadOneySimulationPopin } from './oney';
import { useOneySimulationPopin } from './useOneySimulationPopin';

vi.mock('../../data/usePaymentConfig/usePaymentProviderSettings', () => ({
  usePaymentProviderSettings: vi.fn(),
}));

vi.mock('../../utils/useCapsConfigContext', () => ({
  useCapsConfigContext: vi.fn(),
}));

vi.mock('../../utils/useForm', () => ({
  useWatch: vi.fn(),
}));

vi.mock('../../utils/useScriptLoader', () => ({
  useScriptLoader: vi.fn(),
}));

vi.mock('./oney', () => ({
  getOneyPopinOptions: vi.fn(),
  loadOneySimulationPopin: vi.fn(),
}));

const mockUsePaymentProviderSettings = vi.mocked(usePaymentProviderSettings);
const mockUseCapsConfigContext = vi.mocked(useCapsConfigContext);
const mockUseWatch = vi.mocked(useWatch);
const mockUseScriptLoader = vi.mocked(useScriptLoader);
const mockGetOneyPopinOptions = vi.mocked(getOneyPopinOptions);
const mockLoadOneySimulationPopin = vi.mocked(loadOneySimulationPopin);

describe('useOneySimulationPopin', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCapsConfigContext.mockReturnValue({
      language: 'fr',
      country: 'FR',
    } as any);

    mockUseWatch.mockReturnValue('999.99');

    mockUsePaymentProviderSettings.mockReturnValue({
      merchant_id: 'merchant-123',
      payment_mode: '3x',
      script_url: 'https://oney.com/script.js',
    } as any);

    mockUseScriptLoader.mockReturnValue({
      isLoaded: true,
    } as any);

    mockGetOneyPopinOptions.mockReturnValue({
      payment_amount: 999.99,
      merchant_guid: 'merchant-123',
      country: 'FR',
      language: 'fr',
      filter_by: 'filters',
      filters: [],
      hide_logo: true,
    });
  });

  it('should return handlePopinClick function', () => {
    const { result } = renderHook(() => useOneySimulationPopin());

    expect(result.current).toHaveProperty('handlePopinClick');
    expect(typeof result.current.handlePopinClick).toBe('function');
  });

  it('should call getOneyPopinOptions with correct parameters when popin is clicked', () => {
    const { result } = renderHook(() => useOneySimulationPopin());

    result.current.handlePopinClick();

    expect(mockGetOneyPopinOptions).toHaveBeenCalledWith({
      payment_amount: 999.99,
      merchant_id: 'merchant-123',
      country: 'FR',
      language: 'fr',
      payment_mode: '3x',
    });
  });

  it('should call loadOneySimulationPopin with options', () => {
    const { result } = renderHook(() => useOneySimulationPopin());

    result.current.handlePopinClick();

    expect(mockLoadOneySimulationPopin).toHaveBeenCalledWith({
      payment_amount: 999.99,
      merchant_guid: 'merchant-123',
      country: 'FR',
      language: 'fr',
      filter_by: 'filters',
      filters: [],
      hide_logo: true,
    });
  });

  it('should not call loadOneySimulationPopin when script is not loaded', () => {
    mockUseScriptLoader.mockReturnValue({
      isLoaded: false,
    } as any);

    const { result } = renderHook(() => useOneySimulationPopin());

    result.current.handlePopinClick();

    expect(mockLoadOneySimulationPopin).not.toHaveBeenCalled();
  });

  it('should load script from provider settings', () => {
    renderHook(() => useOneySimulationPopin());

    expect(mockUseScriptLoader).toHaveBeenCalledWith('https://oney.com/script.js');
  });

  it('should call usePaymentProviderSettings with EHIPAYBNPL provider', () => {
    renderHook(() => useOneySimulationPopin());

    expect(mockUsePaymentProviderSettings).toHaveBeenCalledWith(PspProviders.EHIPAYBNPL);
  });

  it('should watch amount from form', () => {
    renderHook(() => useOneySimulationPopin());

    expect(mockUseWatch).toHaveBeenCalledWith('amount');
  });

  it('should handle 4x payment mode', () => {
    mockUsePaymentProviderSettings.mockReturnValue({
      merchant_id: 'merchant-456',
      payment_mode: '4x',
      script_url: 'https://oney.com/script.js',
    } as any);

    const { result } = renderHook(() => useOneySimulationPopin());

    result.current.handlePopinClick();

    expect(mockGetOneyPopinOptions).toHaveBeenCalledWith({
      payment_amount: 999.99,
      merchant_id: 'merchant-456',
      country: 'FR',
      language: 'fr',
      payment_mode: '4x',
    });
  });

  it('should handle different languages and countries', () => {
    mockUseCapsConfigContext.mockReturnValue({
      language: 'es',
      country: 'ES',
    } as any);

    const { result } = renderHook(() => useOneySimulationPopin());

    result.current.handlePopinClick();

    expect(mockGetOneyPopinOptions).toHaveBeenCalledWith({
      payment_amount: 999.99,
      merchant_id: 'merchant-123',
      country: 'ES',
      language: 'es',
      payment_mode: '3x',
    });
  });
});
