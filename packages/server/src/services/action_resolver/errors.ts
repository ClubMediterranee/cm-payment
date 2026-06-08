export class ActionResolverValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActionResolverValidationError';
  }
}
