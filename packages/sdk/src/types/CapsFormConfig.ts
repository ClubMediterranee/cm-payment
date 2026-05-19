import { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfigurationValidation } from '../__generated__/bff/index.schemas';
import type { Content } from './Content';

export type CapsFormConfig = {
  content: Content;
  isSeller: boolean;
  maxAmount: number;
  getProviderValidation: (
    providerId: string,
  ) =>
    | PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfigurationValidation
    | undefined;
};
