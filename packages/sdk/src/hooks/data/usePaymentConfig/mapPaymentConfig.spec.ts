import { OidcIssuerTypes } from '../../../types/CapsSettings';
import { mapPaymentConfig } from './mapPaymentConfig';

describe('mapPaymentConfig', () => {
  describe('providers extraction', () => {
    it('should extract PSP providers for GM issuer', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.psp.evoxpay', value: true },
          { key: 'featureFlipping.psp.mhipay', value: false },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers.EVOXPAY).toEqual({
        is_active: true,
        display_type: 'redirect',
        settings: {},
      });
      expect(result.providers.MHIPAY.is_active).toBe(false);
      expect(result.providers.MHIPAY.display_type).toBe('hosted_field');
      expect(result.providers.MHIPAY.settings).toHaveProperty('environment', 'stage');
    });

    it('should extract seller PSP providers for GO issuer', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.seller.psp.evoxpay', value: true },
          { key: 'featureFlipping.seller.psp.paypal', value: false },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GO,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true, display_type: 'redirect', settings: {} },
        PAYPAL: { is_active: false, display_type: 'redirect', settings: {} },
      });
    });

    it('should extract seller PSP providers for PARTNERS issuer', () => {
      const featureFlip = {
        keys: [{ key: 'featureFlipping.seller.psp.stripe', value: true }],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.PARTNERS,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        STRIPE: { is_active: true, display_type: 'redirect', settings: {} },
      });
    });

    it('should ignore non-PSP keys when extracting providers', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.psp.evoxpay', value: true },
          { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true },
          { key: 'featureFlipping.someOtherFeature', value: true },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true, display_type: 'redirect', settings: {} },
      });
    });

    it('should ignore psp.iframe.* and psp.*.iframe patterns', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.psp.evoxpay', value: true },
          { key: 'featureFlipping.psp.iframe.hipay', value: true },
          { key: 'featureFlipping.psp.paypal.iframe', value: true },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true, display_type: 'redirect', settings: {} },
      });
    });
  });

  describe('feature flips extraction', () => {
    it('should extract isFreeDepositEnabled for GM issuer', () => {
      const featureFlip = {
        keys: [{ key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true }],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });

    it('should extract isFreeDepositEnabled for GO issuer with seller prefix', () => {
      const featureFlip = {
        keys: [{ key: 'featureFlipping.seller.booking.banking.enableFreeDeposit', value: true }],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GO,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });

    it('should extract isFreeDepositEnabled for PARTNERS issuer with seller prefix', () => {
      const featureFlip = {
        keys: [{ key: 'featureFlipping.seller.booking.banking.enableFreeDeposit', value: false }],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.PARTNERS,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: false,
      });
    });

    it('should return empty featureFlip when no mapped features exist', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.unmappedFeature', value: true },
          { key: 'featureFlipping.anotherUnmappedFeature', value: false },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: false,
      });
    });
  });

  describe('override handling', () => {
    it('should apply locale override for GM issuer', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: false },
          { key: 'override.fr-FR.featureFlipping.booking.banking.enableFreeDeposit', value: true },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });

    it('should apply locale override for GO issuer', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.seller.booking.banking.enableFreeDeposit', value: false },
          {
            key: 'override.fr-FR.featureFlipping.seller.booking.banking.enableFreeDeposit',
            value: true,
          },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GO,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
    });

    it('should not apply override for different locale', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: false },
          { key: 'override.en-US.featureFlipping.booking.banking.enableFreeDeposit', value: true },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: false,
      });
    });

    it('should apply override to PSP providers', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.psp.evoxpay', value: false },
          { key: 'override.fr-FR.featureFlipping.psp.evoxpay', value: true },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({
        EVOXPAY: { is_active: true, display_type: 'redirect', settings: {} },
      });
    });
  });

  describe('complete payload transformation', () => {
    it('should transform complete payload with providers, feature flips, and settings', () => {
      const featureFlip = {
        keys: [
          { key: 'featureFlipping.psp.evoxpay', value: true },
          { key: 'featureFlipping.psp.mhipay', value: false },
          { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true },
        ],
      };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers.EVOXPAY).toEqual({
        is_active: true,
        display_type: 'redirect',
        settings: {},
      });
      expect(result.providers.MHIPAY.is_active).toBe(false);
      expect(result.providers.MHIPAY.display_type).toBe('hosted_field');
      expect(result.providers.MHIPAY.settings).toHaveProperty('environment', 'stage');
      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: true,
      });
      expect(result.settings).toEqual({});
    });

    it('should handle empty keys array', () => {
      const featureFlip = { keys: [] };

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({});
      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: false,
      });
      expect(result.settings).toEqual({});
    });

    it('should handle missing keys property', () => {
      const featureFlip = {} as any;

      const result = mapPaymentConfig({
        featureFlip,
        settings: {},
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });

      expect(result.providers).toEqual({});
      expect(result.featureFlip).toEqual({
        isFreeDepositEnabled: false,
      });
      expect(result.settings).toEqual({});
    });
  });
});
