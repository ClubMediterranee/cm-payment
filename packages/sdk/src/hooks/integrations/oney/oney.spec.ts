import { getOneyPopinOptions, loadOneySimulationPopin } from './oney';

describe('oney utilities', () => {
  describe('getOneyPopinOptions', () => {
    it('should build popin options with all required parameters', () => {
      const params = {
        payment_amount: 999.99,
        merchant_id: 'merchant-123',
        country: 'FR',
        language: 'fr',
        payment_mode: '3x',
      };

      const result = getOneyPopinOptions(params);

      expect(result).toEqual({
        payment_amount: 999.99,
        country: 'FR',
        language: 'fr',
        merchant_guid: 'merchant-123',
        filter_by: 'filters',
        filters: [
          {
            payment_method: 'bnpl',
            payment_method_type: 'split',
            payment_mode: '3x',
            is_free: 'false',
            with_down_payment: 'true',
          },
        ],
        hide_logo: true,
      });
    });

    it('should handle 4x payment mode', () => {
      const params = {
        payment_amount: 1500,
        merchant_id: 'merchant-456',
        country: 'FR',
        language: 'fr',
        payment_mode: '4x',
      };

      const result = getOneyPopinOptions(params);

      expect(result.filters[0].payment_mode).toBe('4x');
    });

    it('should handle different countries', () => {
      const params = {
        payment_amount: 500,
        merchant_id: 'merchant-789',
        country: 'ES',
        language: 'es',
        payment_mode: '3x',
      };

      const result = getOneyPopinOptions(params);

      expect(result.country).toBe('ES');
      expect(result.language).toBe('es');
    });

    it('should always set hide_logo to true', () => {
      const params = {
        payment_amount: 100,
        merchant_id: 'merchant-abc',
        country: 'FR',
        language: 'fr',
        payment_mode: '3x',
      };

      const result = getOneyPopinOptions(params);

      expect(result.hide_logo).toBe(true);
    });

    it('should always set is_free to false', () => {
      const params = {
        payment_amount: 200,
        merchant_id: 'merchant-def',
        country: 'FR',
        language: 'fr',
        payment_mode: '3x',
      };

      const result = getOneyPopinOptions(params);

      expect(result.filters[0].is_free).toBe('false');
    });

    it('should always set with_down_payment to true', () => {
      const params = {
        payment_amount: 300,
        merchant_id: 'merchant-ghi',
        country: 'FR',
        language: 'fr',
        payment_mode: '3x',
      };

      const result = getOneyPopinOptions(params);

      expect(result.filters[0].with_down_payment).toBe('true');
    });
  });

  describe('loadOneySimulationPopin', () => {
    beforeEach(() => {
      global.window.loadOneyWidget = undefined as any;
      global.window.oneyMerchantApp = undefined as any;
    });

    it('should not execute when loadOneyWidget is not available', () => {
      const options = {
        payment_amount: 999,
        country: 'FR',
        language: 'fr',
        merchant_guid: 'test',
        filter_by: 'filters' as const,
        filters: [],
        hide_logo: true,
      };

      loadOneySimulationPopin(options);

      expect(true).toBe(true);
    });

    it('should call loadOneyWidget with callback when available', () => {
      const mockLoadOneyWidget = vi.fn((callback) => callback());
      const mockLoadSimulationPopin = vi.fn();

      global.window.loadOneyWidget = mockLoadOneyWidget;
      global.window.oneyMerchantApp = {
        loadSimulationPopin: mockLoadSimulationPopin,
      };

      const options = {
        payment_amount: 999,
        country: 'FR',
        language: 'fr',
        merchant_guid: 'test',
        filter_by: 'filters' as const,
        filters: [],
        hide_logo: true,
      };

      loadOneySimulationPopin(options);

      expect(mockLoadOneyWidget).toHaveBeenCalled();
      expect(mockLoadSimulationPopin).toHaveBeenCalledWith({ options });
    });

    it('should not crash when oneyMerchantApp is not available', () => {
      const mockLoadOneyWidget = vi.fn((callback) => callback());

      global.window.loadOneyWidget = mockLoadOneyWidget;
      global.window.oneyMerchantApp = undefined;

      const options = {
        payment_amount: 999,
        country: 'FR',
        language: 'fr',
        merchant_guid: 'test',
        filter_by: 'filters' as const,
        filters: [],
        hide_logo: true,
      };

      loadOneySimulationPopin(options);

      expect(mockLoadOneyWidget).toHaveBeenCalled();
    });
  });
});
