import type { Validate } from '../capsFormSchema';

export type ExpiryDate = {
  expirationMonth: string;
  expirationYear: string;
};

export const parseExpiryDate = (value = ''): ExpiryDate | undefined => {
  const match = /^(\d{4}) \/ (0[1-9]|1[0-2])$/.exec(value);

  return match ? { expirationYear: match[1], expirationMonth: match[2] } : undefined;
};

const isPast = ({ expirationYear, expirationMonth }: ExpiryDate) => {
  const now = new Date();

  return (
    Number(expirationYear) * 12 + Number(expirationMonth) <
    now.getFullYear() * 12 + now.getMonth() + 1
  );
};

export const validateExpiryDate: Validate = (data, { content, getProviderConfiguration }) => {
  const validation = getProviderConfiguration(data.provider_id);

  if (!validation?.requires_expiry_date) {
    return undefined;
  }

  const value = data.creditCard?.expiryDate;
  const expiryDate = parseExpiryDate(value);
  const path = ['creditCard', 'expiryDate'];

  if (!value) {
    return { path, message: content.creditCardForm.validation.expiryDate };
  }

  if (!expiryDate) {
    return { path, message: content.creditCardForm.validation.expiryDateInvalid };
  }

  if (isPast(expiryDate)) {
    return { path, message: content.creditCardForm.validation.expired };
  }

  return undefined;
};
