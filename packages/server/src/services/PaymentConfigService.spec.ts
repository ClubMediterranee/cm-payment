import { DITest } from '@tsed/di';
import { describe, expect, it, vi } from 'vitest';

import { fetcher } from '../infra/http/fetcher.js';
import { OidcIssuerTypes } from '../types/CapsSettings.js';
import { LegacyCmsFeatureFlipKey, LegacyCmsFeatureFlipResponse } from '../types/LegacyCms.js';
import { PaymentConfigService } from './PaymentConfigService.js';

export const getLegacyCmsFeatureFlip = (cmsUrl: string) => {
  return fetcher<LegacyCmsFeatureFlipResponse>({
    url: `${cmsUrl}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`,
    method: 'GET',
  });
};

export const getLegacyCms = (cmsUrl: string, locale: string) => {
  return fetcher<Record<string, unknown>>({
    url: `${cmsUrl}/v1/contents/b2c-common/locales/${locale}/releases/live/value`,
    method: 'GET',
  });
};

global.fetch = vi.fn();

const createMockCmsResponse = (keys: LegacyCmsFeatureFlipKey[]): LegacyCmsFeatureFlipResponse => ({
  keys,
});

describe('PaymentConfigService', () => {
  afterEach(() => {
    DITest.reset();
    vi.clearAllMocks();
  });

  describe('getPaymentConfig', () => {
    it('should use return config', async () => {
      const service = await DITest.invoke(PaymentConfigService);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () =>
          createMockCmsResponse([
            { key: 'featureFlipping.psp.evoxpay', value: true },
            { key: 'featureFlipping.psp.mhipay', value: false },
          ]),
      } as Response);

      const result = await service.getPaymentConfig({
        cms_url: 'https://example.com/cms',
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true, display_type: 'redirect' },
        MHIPAY: { is_active: false, display_type: 'hosted_field' },
      });
    });

    it('should transform booking.banking.enableFreeDeposit to isFreeDepositEnabled', async () => {
      const service = await DITest.invoke(PaymentConfigService);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [{ key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true }],
        }),
      } as Response);

      const result = await service.getPaymentConfig({
        cms_url: 'https://example.com/cms',
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });

    it('should apply override keys for matching locale', async () => {
      const service = await DITest.invoke(PaymentConfigService);

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

      const result = await service.getPaymentConfig({
        cms_url: 'https://example.com/cms',
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });
  });

  describe('GO issuer type transformation', () => {
    it('should transform seller.psp feature flips to providers config', async () => {
      const service = await DITest.invoke(PaymentConfigService);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [
            { key: 'featureFlipping.seller.psp.evoxpay', value: true },
            { key: 'featureFlipping.seller.psp.paypal', value: false },
          ],
        }),
      } as Response);

      const result = await service.getPaymentConfig({
        cms_url: 'https://example.com/cms',
        issuerType: OidcIssuerTypes.GO,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true, display_type: 'redirect' },
        PAYPAL: { is_active: false, display_type: 'redirect' },
      });
    });

    it('should transform seller.booking.banking.enableFreeDeposit to isFreeDepositEnabled', async () => {
      const service = await DITest.invoke(PaymentConfigService);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [{ key: 'featureFlipping.seller.booking.banking.enableFreeDeposit', value: true }],
        }),
      } as Response);

      const result = await service.getPaymentConfig({
        cms_url: 'https://example.com/cms',
        issuerType: OidcIssuerTypes.GO,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });
  });
  describe('PARTNERS issuer type transformation', () => {
    it('should transform seller.psp feature flips to providers config for PARTNERS', async () => {
      const service = await DITest.invoke(PaymentConfigService);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [{ key: 'featureFlipping.seller.psp.stripe', value: true }],
        }),
      } as Response);

      const result = await service.getPaymentConfig({
        cms_url: 'https://example.com/cms',
        issuerType: OidcIssuerTypes.PARTNERS,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        STRIPE: { is_active: true, display_type: 'redirect' },
      });
    });
  });

  describe('mixed feature flips transformation', () => {
    it('should handle mixed feature flips correctly', async () => {
      const service = await DITest.invoke(PaymentConfigService);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          keys: [
            { key: 'featureFlipping.psp.evoxpay', value: true },
            { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true },
          ],
        }),
      } as Response);

      const result = await service.getPaymentConfig({
        cms_url: 'https://example.com/cms',
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true, display_type: 'redirect' },
      });
      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
      expect(result.settings).toEqual({});
    });
  });

  describe('error handling', () => {
    it('should throw error on 404', async () => {
      const service = await DITest.invoke(PaymentConfigService);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({
          status_code: 404,
          error_description: 'Not found',
        }),
      } as Response);

      await expect(
        service.getPaymentConfig({
          cms_url: 'https://example.com/cms',
          issuerType: OidcIssuerTypes.GM,
          locale: 'fr-FR',
        }),
      ).rejects.toThrow('Not found');
    });

    it('should throw error on other errors', async () => {
      const service = await DITest.invoke(PaymentConfigService);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({
          error_description: 'Server error',
        }),
      } as Response);

      await expect(
        service.getPaymentConfig({
          cms_url: 'https://example.com/cms',
          issuerType: OidcIssuerTypes.GM,
          locale: 'fr-FR',
        }),
      ).rejects.toThrow('Server error');
    });
  });
});
