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
