import { defaultContent } from '../../content/default';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import { PspProviders } from '../../types/PspProviders';
import type { CapsFormSchema } from '../capsFormSchema';
import { parseExpiryDate, validateExpiryDate } from './validateExpiryDate';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: false,
  maxAmount: 10000,
  getProviderConfiguration: (providerId: string) => {
    if (providerId === PspProviders.MCYBERSOURCE) {
      return { requires_expiry_date: true };
    }
    return undefined;
  },
};

describe('validateExpiryDate', () => {
  it('returns undefined when provider is not Cybersource', () => {
    const result = validateExpiryDate(
      {
        provider_id: PspProviders.HIPAY,
        creditCard: {},
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when provider does not require expiry date', () => {
    const customConfig: CapsFormConfig = {
      ...mockConfig,
      getProviderConfiguration: () => ({ requires_expiry_date: false }),
    };

    const result = validateExpiryDate(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: { expiryDate: '2025 / 12' },
      } as unknown as CapsFormSchema,
      customConfig,
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
    const pastDateString = `${pastDate.getFullYear()} / ${String(pastDate.getMonth() + 1).padStart(2, '0')}`;

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
    const futureDateString = `${futureDate.getFullYear()} / ${String(futureDate.getMonth() + 1).padStart(2, '0')}`;

    const result = validateExpiryDate(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: { expiryDate: futureDateString },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  const validate = (expiryDate: string) =>
    validateExpiryDate(
      {
        provider_id: PspProviders.MCYBERSOURCE,
        creditCard: { expiryDate },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

  it('accepts the current month, the card being valid until its end', () => {
    const now = new Date();

    expect(validate(`${now.getFullYear()} / ${String(now.getMonth() + 1).padStart(2, '0')}`)).toBe(
      undefined,
    );
  });

  it.each(['2030 / 1', '2030 / 13', '2030 / 00', '2030-12', 'abc'])(
    'returns an invalid date error for %j',
    (expiryDate) => {
      expect(validate(expiryDate)).toEqual({
        path: ['creditCard', 'expiryDate'],
        message: defaultContent.creditCardForm.validation.expiryDateInvalid,
      });
    },
  );
});

describe('parseExpiryDate', () => {
  it('splits a YYYY / MM value into the year and the month', () => {
    expect(parseExpiryDate('2030 / 07')).toEqual({ expirationYear: '2030', expirationMonth: '07' });
  });

  it('returns undefined for an empty or malformed value', () => {
    expect(parseExpiryDate()).toBeUndefined();
    expect(parseExpiryDate('2030 / 7')).toBeUndefined();
  });
});
