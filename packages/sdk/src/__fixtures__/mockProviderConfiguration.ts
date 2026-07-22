import type { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfiguration } from '../__generated__/bff/index.schemas';

export const mockProviderConfiguration = (
  overrides: Partial<PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfiguration> = {},
) => ({
  display_type: 'redirect',
  settings: {},
  ...overrides,
});
