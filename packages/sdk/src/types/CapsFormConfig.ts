import type { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfiguration } from '../__generated__/bff/index.schemas';
import type { Content } from './Content';

type ProviderConfiguration =
  PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfiguration;

export type CapsFormConfig = {
  content: Content;
  isSeller: boolean;
  maxAmount: number;
  getProviderConfiguration: (providerId: string) => Partial<ProviderConfiguration> | undefined;
};
