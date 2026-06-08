export class PaymentProvidersValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentProvidersValidationError';
  }
}
