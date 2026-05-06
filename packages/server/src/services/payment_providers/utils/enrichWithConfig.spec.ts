import { describe, expect, it } from 'vitest';

import { PaymentProvider1 } from '../../../infra/api/__generated__/index.schemas.js';
import { ProviderConfigMap } from '../types.js';
import { enrichWithConfig } from './enrichWithConfig.js';

describe('enrichWithConfig', () => {
  it('should enrich provider with default config when no config exists', () => {
    const providers: PaymentProvider1[] = [
      {
        id: 'TEST_PROVIDER',
        label: 'Test Provider',
        category_payment_method: 'Card',
      } as PaymentProvider1,
    ];
    const config: ProviderConfigMap = {};

    const result = enrichWithConfig(providers, config);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: {
          requires_token: false,
          requires_expiry_date: false,
        },
      },
      payment_conditions: {},
    });
  });

  it('should use display_type from config', () => {
    const providers: PaymentProvider1[] = [
      {
        id: 'TEST_PROVIDER',
        label: 'Test Provider',
        category_payment_method: 'Card',
      } as PaymentProvider1,
    ];
    const config: ProviderConfigMap = {
      TEST_PROVIDER: {
        is_active: true,
        display_type: 'hosted_field',
        settings: {},
      },
    };

    const result = enrichWithConfig(providers, config);

    expect(result[0].configuration.display_type).toBe('hosted_field');
  });

  it('should set requires_token to true for hosted_field display type', () => {
    const providers: PaymentProvider1[] = [
      {
        id: 'TEST_PROVIDER',
        label: 'Test Provider',
        category_payment_method: 'Card',
      } as PaymentProvider1,
    ];
    const config: ProviderConfigMap = {
      TEST_PROVIDER: {
        is_active: true,
        display_type: 'hosted_field',
        settings: {},
      },
    };

    const result = enrichWithConfig(providers, config);

    expect(result[0].configuration.validation.requires_token).toBe(true);
  });

  it('should apply MUPLIFT specific validation rules', () => {
    const providers: PaymentProvider1[] = [
      {
        id: 'MUPLIFT',
        label: 'Uplift',
        category_payment_method: 'BuyNowPayLater',
      } as PaymentProvider1,
    ];
    const config: ProviderConfigMap = {
      MUPLIFT: {
        is_active: true,
        display_type: 'redirect',
        settings: {},
      },
    };

    const result = enrichWithConfig(providers, config);

    expect(result[0].configuration.validation).toEqual({
      requires_token: true,
      requires_expiry_date: false,
    });
  });

  it('should apply MCYBERSOURCE specific validation rules', () => {
    const providers: PaymentProvider1[] = [
      {
        id: 'MCYBERSOURCE',
        label: 'Cybersource',
        category_payment_method: 'Card',
      } as PaymentProvider1,
    ];
    const config: ProviderConfigMap = {
      MCYBERSOURCE: {
        is_active: true,
        display_type: 'iframe',
        settings: {},
      },
    };

    const result = enrichWithConfig(providers, config);

    expect(result[0].configuration.validation).toEqual({
      requires_token: false,
      requires_expiry_date: true,
    });
  });

  it('should include settings from config', () => {
    const providers: PaymentProvider1[] = [
      {
        id: 'TEST_PROVIDER',
        label: 'Test Provider',
        category_payment_method: 'Card',
      } as PaymentProvider1,
    ];
    const config: ProviderConfigMap = {
      TEST_PROVIDER: {
        is_active: true,
        display_type: 'redirect',
        settings: {
          min_days_before_departure: '7',
          custom_setting: 'value',
        },
      },
    };

    const result = enrichWithConfig(providers, config);

    expect(result[0].configuration.settings).toEqual({
      min_days_before_departure: '7',
      custom_setting: 'value',
    });
  });

  it('should enrich multiple providers', () => {
    const providers: PaymentProvider1[] = [
      {
        id: 'PROVIDER_1',
        label: 'Provider 1',
        category_payment_method: 'Card',
      } as PaymentProvider1,
      {
        id: 'PROVIDER_2',
        label: 'Provider 2',
        category_payment_method: 'BuyNowPayLater',
      } as PaymentProvider1,
    ];
    const config: ProviderConfigMap = {
      PROVIDER_1: {
        is_active: true,
        display_type: 'hosted_field',
        settings: {},
      },
      PROVIDER_2: {
        is_active: true,
        display_type: 'redirect',
        settings: {},
      },
    };

    const result = enrichWithConfig(providers, config);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('PROVIDER_1');
    expect(result[1].id).toBe('PROVIDER_2');
  });

  it('should preserve original provider properties', () => {
    const providers: PaymentProvider1[] = [
      {
        id: 'TEST_PROVIDER',
        label: 'Test Provider',
        category_payment_method: 'Card',
        description: 'Test Description',
      } as PaymentProvider1,
    ];
    const config: ProviderConfigMap = {};

    const result = enrichWithConfig(providers, config);

    expect(result[0].id).toBe('TEST_PROVIDER');
    expect(result[0].label).toBe('Test Provider');
    expect(result[0].category_payment_method).toBe('Card');
    expect(result[0].description).toBe('Test Description');
  });
});
