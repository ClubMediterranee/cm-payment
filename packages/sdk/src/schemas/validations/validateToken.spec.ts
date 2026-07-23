import { defaultContent } from '../../content/default';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import type { CapsFormSchema } from '../capsFormSchema';
import { validateToken } from './validateToken';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: false,
  maxAmount: 10000,
  getProviderConfiguration: (providerId: string) => {
    if (providerId === 'MHIPAY') {
      return { requires_token: true };
    }
    return undefined;
  },
};

describe('validateToken', () => {
  it('returns undefined when provider is not MHIPAY', () => {
    const result = validateToken(
      { provider_id: 'TEST_PROVIDER' } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns error when provider is MHIPAY and token is missing or has no value', () => {
    const resultWithoutToken = validateToken(
      { provider_id: 'MHIPAY' } as unknown as CapsFormSchema,
      mockConfig,
    );

    const resultWithoutValue = validateToken(
      { provider_id: 'MHIPAY', token: { status: 'idle' } } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(resultWithoutToken).toEqual({
      path: ['token', 'value'],
      message: defaultContent.paymentProviders.validation.required,
    });

    expect(resultWithoutValue).toEqual({
      path: ['token', 'value'],
      message: defaultContent.paymentProviders.validation.required,
    });
  });
});
