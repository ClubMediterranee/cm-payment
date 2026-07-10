import type { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfiguration } from '../__generated__/bff/index.schemas';
import type { Content } from './Content';

type ProviderValidation = Pick<
  PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfiguration,
  'requires_token' | 'requires_expiry_date' | 'requires_card_holder' | 'requires_contact_choice'
>;

export type CapsFormConfig = {
  content: Content;
  isSeller: boolean;
  maxAmount: number;
  getProviderValidation: (providerId: string) => ProviderValidation | undefined;
};
