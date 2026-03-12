import type { Hipay, HipayError, HipayInstance, HipaySDK } from '../../../types/Hipay';
import { createHipayHostedFields, mapHipayErrorsToObject } from './hipay';

describe('hipay utilities', () => {
  describe('createHipayHostedFields', () => {
    let mockHipaySDK: HipaySDK;
    let mockHipayInstance: HipayInstance;
    let mockHiPay: Hipay;

    beforeEach(() => {
      mockHipayInstance = {
        on: vi.fn(),
        getPaymentData: vi.fn(),
      };

      mockHipaySDK = {
        create: vi.fn().mockReturnValue(mockHipayInstance),
      };

      mockHiPay = vi.fn().mockReturnValue(mockHipaySDK) as Hipay;

      (global as any).window = {
        HiPay: mockHiPay,
      };
    });

    it('should initialize Hipay SDK with config and create instance with fields', () => {
      const fields = {
        cardHolder: { placeholder: 'Nom complet', selector: '#card-holder' },
        cardNumber: { placeholder: 'Numéro de carte', selector: '#card-number' },
        cvc: { placeholder: 'CVV', selector: '#cvc' },
        expiryDate: { placeholder: "Date d'expiration", selector: '#expiry' },
      };

      const mockConfig = {
        username: 'test-username',
        password: 'test-password',
        environment: 'stage',
        max_amount: null,
        min_days_before_departure: null,
      };

      const result = createHipayHostedFields(fields, mockConfig);

      expect(mockHiPay).toHaveBeenCalledWith(mockConfig);
      expect(mockHipaySDK.create).toHaveBeenCalledWith('card', { fields });
      expect(result).toBe(mockHipayInstance);
    });
  });

  describe('mapHipayErrorsToObject', () => {
    it('should map errors array to object', () => {
      const errors: HipayError[] = [
        { field: 'cardNumber', error: 'Invalid card number' },
        { field: 'cvc', error: 'Invalid CVC' },
      ];

      const result = mapHipayErrorsToObject(errors);

      expect(result).toEqual({
        cardNumber: 'Invalid card number',
        cvc: 'Invalid CVC',
      });
    });

    it('should handle empty array', () => {
      expect(mapHipayErrorsToObject([])).toEqual({});
    });
  });
});
