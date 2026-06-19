export const formatCurrency = ({
  amount,
  currency,
  locale,
}: {
  amount: number;
  currency: string | undefined;
  locale: string;
}) => {
  if (!currency) {
    return new Intl.NumberFormat(locale).format(amount);
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export const getCurrencySymbol = ({ currency, locale }: { currency: string; locale: string }) => {
  return (
    new Intl.NumberFormat(locale, { style: 'currency', currency })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value || currency
  );
};
