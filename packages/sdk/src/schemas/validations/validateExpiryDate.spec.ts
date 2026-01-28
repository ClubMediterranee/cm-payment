import { defaultContent } from '../../content/default';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import { PspProviders } from '../../types/PspProviders';
import type { CapsFormSchema } from '../capsFormSchema';
import { validateExpiryDate } from './validateExpiryDate';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: false,
  maxAmount: 10000,
  providersConfig: {
    [PspProviders.MCYBERSOURCE]: {
      is_active: true,
      display_type: 'hosted_field',
    },
  },
};

describe('validateExpiryDate', () => {
  it('returns undefined when provider is not Cybersource', () => {
    const result = validateExpiryDate(
      {
        provider_id: PspProviders.HIPAY,
        creditCard: {},
      } as unknown as CapsFormSchema,
      {
        ...mockConfig,
        providersConfig: {
          [PspProviders.HIPAY]: {
            is_active: true,
            display_type: 'hosted_field',
          },
        },
      },
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when provider has no hosted field', () => {
    const result = validateExpiryDate(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: { expiryDate: '2025-12' },
      } as unknown as CapsFormSchema,
      {
        ...mockConfig,
        providersConfig: {
          [PspProviders.MCYBERSOURCE]: {
            is_active: true,
            display_type: 'iframe',
          },
        },
      },
    );

    expect(result).toBeUndefined();
  });

  it('returns error when expiryDate is empty', () => {
    const result = validateExpiryDate(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: {},
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual({
      path: ['creditCard', 'expiryDate'],
      message: defaultContent.creditCardForm.validation.expiryDate,
    });
  });

  it('returns error when expiryDate is in the past', () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    const pastDateString = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}`;

    const result = validateExpiryDate(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: { expiryDate: pastDateString },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual({
      path: ['creditCard', 'expiryDate'],
      message: defaultContent.creditCardForm.validation.expired,
    });
  });

  it('returns undefined when expiryDate is in the future', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;

    const result = validateExpiryDate(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: { expiryDate: futureDateString },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });
});
