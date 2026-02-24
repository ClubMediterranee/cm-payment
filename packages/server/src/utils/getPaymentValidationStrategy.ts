/**
 * @deprecated This function will be removed in a future version.
 * The validation strategy will be determined by the provider configuration
 * from the API instead of being hardcoded.
 */
export const getPaymentValidationStrategy = (providerId = ''): 'polling' | 'notify' => {
  if (providerId.startsWith('EVOXPAY') || providerId.startsWith('EPAYGATE')) {
    return 'polling';
  }

  return 'notify';
};
