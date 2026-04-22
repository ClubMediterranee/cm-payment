export class PaymentScheduleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentScheduleValidationError';
  }
}

export class PaymentScheduleNotFoundError extends Error {
  constructor(id: string | number) {
    super(`No payment schedule found for id: ${id}`);
    this.name = 'PaymentScheduleNotFoundError';
  }
}

export class UnsupportedActionError extends Error {
  constructor(action: string) {
    super(`Unsupported action: ${action}`);
    this.name = 'UnsupportedActionError';
  }
}
