import { defaultContent } from '../../content/default';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import { PspProviders } from '../../types/PspProviders';
import type { CapsFormSchema } from '../capsFormSchema';
import { validateCardHolder } from './validateCardHolder';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: false,
  maxAmount: 10000,
  getProviderConfiguration: (providerId: string) => {
    if (providerId === PspProviders.MCYBERSOURCE) {
      return { requires_card_holder: true };
    }
    return undefined;
  },
};

describe('validateCardHolder', () => {
  it('returns undefined when provider does not require a card holder', () => {
    const result = validateCardHolder(
      {
        provider_id: PspProviders.HIPAY,
        creditCard: {},
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when requires_card_holder is false', () => {
    const customConfig: CapsFormConfig = {
      ...mockConfig,
      getProviderConfiguration: () => ({ requires_card_holder: false }),
    };

    const result = validateCardHolder(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: { cardHolder: 'John Doe' },
      } as unknown as CapsFormSchema,
      customConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns an error when the card holder is missing', () => {
    const result = validateCardHolder(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: {},
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual({
      path: ['creditCard', 'cardHolder'],
      message: defaultContent.creditCardForm.validation.cardHolder,
    });
  });

  it('returns undefined when the card holder is provided', () => {
    const result = validateCardHolder(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: { cardHolder: 'John Doe' },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });
});
