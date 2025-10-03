import { GLOBAL_SDK_SETTINGS } from '../config.js';
import { isServerValidationProvidersEnabled } from './isServerValidationProvidersEnabled.js';

// Mock the config
vi.mock('../config.js', () => ({
  GLOBAL_SDK_SETTINGS: {
    serverValidationProviders: ['provider1', 'provider2', 'validProvider'],
  },
}));

describe('isServerValidationProvidersEnabled', () => {
  it('should return true when paymentId is provided and provider_id is in serverValidationProviders', () => {
    // Arrange
    const paymentId = 'payment-123';
    const provider_id = 'provider1';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true when paymentId is provided and another valid provider_id is used', () => {
    // Arrange
    const paymentId = 'payment-456';
    const provider_id = 'validProvider';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when paymentId is provided but provider_id is not in serverValidationProviders', () => {
    // Arrange
    const paymentId = 'payment-123';
    const provider_id = 'invalidProvider';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when paymentId is not provided', () => {
    // Arrange
    const paymentId = '';
    const provider_id = 'provider1';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when paymentId is undefined', () => {
    // Arrange
    const paymentId = undefined;
    const provider_id = 'provider1';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when paymentId is null', () => {
    // Arrange
    const paymentId = null;
    const provider_id = 'provider1';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId as any, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when provider_id is not provided', () => {
    // Arrange
    const paymentId = 'payment-123';
    const provider_id = '';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when provider_id is undefined', () => {
    // Arrange
    const paymentId = 'payment-123';
    const provider_id = undefined;

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when provider_id is null', () => {
    // Arrange
    const paymentId = 'payment-123';
    const provider_id = null;

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id as any);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when both paymentId and provider_id are not provided', () => {
    // Arrange
    const paymentId = '';
    const provider_id = '';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when both parameters are undefined', () => {
    // Arrange
    const paymentId = undefined;
    const provider_id = undefined;

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should handle case-sensitive provider_id matching', () => {
    // Arrange
    const paymentId = 'payment-123';
    const provider_id = 'Provider1'; // Different case

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);
  });

  it('should handle empty serverValidationProviders array', () => {
    // Arrange - Mock empty array
    vi.mocked(GLOBAL_SDK_SETTINGS).serverValidationProviders = [];

    const paymentId = 'payment-123';
    const provider_id = 'provider1';

    // Act
    const result = isServerValidationProvidersEnabled(paymentId, provider_id);

    // Assert
    expect(result).toBe(false);

    // Reset mock
    vi.mocked(GLOBAL_SDK_SETTINGS).serverValidationProviders = [
      'provider1',
      'provider2',
      'validProvider',
    ];
  });
});
