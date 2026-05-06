import type { Content } from './Content';

export type ProviderValidation = {
  requires_token?: boolean;
  requires_expiry_date?: boolean;
};

export type CapsFormConfig = {
  content: Content;
  isSeller: boolean;
  maxAmount: number;
  getProviderValidation: (providerId: string) => ProviderValidation | undefined;
};
