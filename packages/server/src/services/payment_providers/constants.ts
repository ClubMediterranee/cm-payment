import { ProviderValidation } from './models.js';

export const PROVIDER_VALIDATION_RULES: Record<string, Partial<ProviderValidation>> = {
  MUPLIFT: {
    requires_token: true,
    requires_expiry_date: false,
  },
  MCYBERSOURCE: {
    requires_token: false,
    requires_expiry_date: true,
  },
} as const;

export const DEFAULT_VALIDATION_RULES: ProviderValidation = {
  requires_token: false,
  requires_expiry_date: false,
};
