import { OidcIssuerTypes } from '../../../types/CapsSettings';
import { getPaymentConfig } from './getPaymentConfig';

global.fetch = vi.fn();

describe('getPaymentConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GM issuer type transformation', () => {
    it('should transform psp feature flips to providers config', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [
            { key: 'featureFlipping.psp.evoxpay', value: true },
            { key: 'featureFlipping.psp.eixopay', value: false },
          ],
        }),
      } as Response);

      const result = await getPaymentConfig({ issuerType: OidcIssuerTypes.GM, locale: 'fr-FR' });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true },
        EIXOPAY: { is_active: false },
      });
    });

    it('should transform booking.banking.enableFreeDeposit to isFreeDepositEnabled', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [{ key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true }],
        }),
      } as Response);

      const result = await getPaymentConfig({ issuerType: OidcIssuerTypes.GM, locale: 'fr-FR' });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });

    it('should apply override keys for matching locale', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [
            { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: false },
            {
              key: 'override.fr-FR.featureFlipping.booking.banking.enableFreeDeposit',
              value: true,
            },
          ],
        }),
      } as Response);

      const result = await getPaymentConfig({ issuerType: OidcIssuerTypes.GM, locale: 'fr-FR' });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });
  });

  describe('GO issuer type transformation', () => {
    it('should transform seller.psp feature flips to providers config', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [
            { key: 'featureFlipping.seller.psp.evoxpay', value: true },
            { key: 'featureFlipping.seller.psp.hipay', value: false },
          ],
        }),
      } as Response);

      const result = await getPaymentConfig({ issuerType: OidcIssuerTypes.GO, locale: 'fr-FR' });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true },
        HIPAY: { is_active: false },
      });
    });

    it('should transform seller.booking.banking.enableFreeDeposit to isFreeDepositEnabled', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [{ key: 'featureFlipping.seller.booking.banking.enableFreeDeposit', value: true }],
        }),
      } as Response);

      const result = await getPaymentConfig({ issuerType: OidcIssuerTypes.GO, locale: 'fr-FR' });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });
  });

  describe('PARTNERS issuer type transformation', () => {
    it('should transform seller.psp feature flips to providers config for PARTNERS', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [{ key: 'featureFlipping.seller.psp.paypal', value: true }],
        }),
      } as Response);

      const result = await getPaymentConfig({
        issuerType: OidcIssuerTypes.PARTNERS,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        PAYPAL: { is_active: true },
      });
    });
  });

  describe('mixed feature flips transformation', () => {
    it('should handle mixed feature flips correctly', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [
            { key: 'featureFlipping.psp.evoxpay', value: true },
            { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true },
          ],
        }),
      } as Response);

      const result = await getPaymentConfig({ issuerType: OidcIssuerTypes.GM, locale: 'fr-FR' });

      expect(result).toEqual({
        providers: {
          EVOXPAY: { is_active: true },
        },
        featureFlip: {
          isFreeDepositEnabled: true,
        },
        settings: {},
      });
    });
  });

  describe('error handling', () => {
    it('should throw error on 404', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({
          status_code: 404,
          error_description: 'Not found',
        }),
      } as Response);

      await expect(
        getPaymentConfig({ issuerType: OidcIssuerTypes.GM, locale: 'fr-FR' }),
      ).rejects.toThrow('Not found');
    });

    it('should throw error on other errors', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({
          errors: [{ error_description: 'Server error' }],
        }),
      } as Response);

      await expect(
        getPaymentConfig({ issuerType: OidcIssuerTypes.GM, locale: 'fr-FR' }),
      ).rejects.toThrow('Server error');
    });
  });
});
