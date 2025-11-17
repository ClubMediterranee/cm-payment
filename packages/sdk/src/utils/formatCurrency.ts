export const formatCurrency = ({
  amount,
  currency,
  locale,
}: {
  amount: number;
  currency: string;
  locale: string;
}) => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};
