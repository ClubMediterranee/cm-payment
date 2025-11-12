import { getCapsConfig } from '../providers/CapsConfigProvider';
import { sdkQueryClient } from '../providers/QueryClientProvider';
import { hasFlip } from './featureFlips';

vi.mock('../providers/QueryClientProvider', () => ({
  sdkQueryClient: {
    getQueryData: vi.fn(),
  },
}));

vi.mock('../providers/CapsConfigProvider', () => ({
  getCapsConfig: vi.fn(),
}));

describe('hasFlip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should automatically prefix key without featureFlipping prefix', () => {
    vi.mocked(getCapsConfig).mockReturnValue({ locale: 'fr-FR' } as any);
    vi.mocked(sdkQueryClient.getQueryData).mockReturnValue({
      'featureFlipping.testFeature': true,
    });

    const result = hasFlip('testFeature');

    expect(result).toBe(true);
  });

  it('should not double prefix key with featureFlipping prefix', () => {
    vi.mocked(getCapsConfig).mockReturnValue({ locale: 'fr-FR' } as any);
    vi.mocked(sdkQueryClient.getQueryData).mockReturnValue({
      'featureFlipping.testFeature': true,
    });

    const result = hasFlip('featureFlipping.testFeature');

    expect(result).toBe(true);
  });

  it('should prioritize locale override when available', () => {
    vi.mocked(getCapsConfig).mockReturnValue({ locale: 'fr-FR' } as any);
    vi.mocked(sdkQueryClient.getQueryData).mockReturnValue({
      'featureFlipping.testFeature': false,
      'override.fr-FR.featureFlipping.testFeature': true,
    });

    const result = hasFlip('testFeature');

    expect(result).toBe(true);
  });

  it('should fall back to global flip when no locale override exists', () => {
    vi.mocked(getCapsConfig).mockReturnValue({ locale: 'en-US' } as any);
    vi.mocked(sdkQueryClient.getQueryData).mockReturnValue({
      'featureFlipping.testFeature': true,
      'override.fr-FR.featureFlipping.testFeature': false,
    });

    const result = hasFlip('testFeature');

    expect(result).toBe(true);
  });

  it('should return false for locale override when value is false', () => {
    vi.mocked(getCapsConfig).mockReturnValue({ locale: 'de-DE' } as any);
    vi.mocked(sdkQueryClient.getQueryData).mockReturnValue({
      'featureFlipping.testFeature': true,
      'override.de-DE.featureFlipping.testFeature': false,
    });

    const result = hasFlip('testFeature');

    expect(result).toBe(false);
  });

  it('should handle undefined global flip value', () => {
    vi.mocked(getCapsConfig).mockReturnValue({ locale: 'fr-FR' } as any);
    vi.mocked(sdkQueryClient.getQueryData).mockReturnValue({});

    const result = hasFlip('nonExistentFeature');

    expect(result).toBe(false);
  });

  it('should correctly build override key with locale', () => {
    vi.mocked(getCapsConfig).mockReturnValue({ locale: 'en-GB' } as any);
    vi.mocked(sdkQueryClient.getQueryData).mockReturnValue({
      'featureFlipping.payment': false,
      'override.en-GB.featureFlipping.payment': true,
    });

    const result = hasFlip('payment');

    expect(result).toBe(true);
  });

  it('should work with prefixed key and locale override', () => {
    vi.mocked(getCapsConfig).mockReturnValue({ locale: 'es-ES' } as any);
    vi.mocked(sdkQueryClient.getQueryData).mockReturnValue({
      'featureFlipping.feature': false,
      'override.es-ES.featureFlipping.feature': true,
    });

    const result = hasFlip('featureFlipping.feature');

    expect(result).toBe(true);
  });
});
