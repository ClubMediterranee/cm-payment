import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { useWatch } from '../../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../../hooks/utils/useProviderIntegrationMode';
import { formatCurrency } from '../../utils/formatCurrency';
import { renderTemplate } from '../../utils/renderTemplate';

export const PayLabel = () => {
  const { content, locale } = useCapsConfigContext();
  const { redirect } = useProviderIntegrationMode();
  const amount = useWatch('amount');
  const donationAmount = useWatch('donation_amount');
  const currency = useWatch('currency');

  if (redirect) {
    return content.submit.redirect;
  }

  return renderTemplate(content.submit.pay, {
    amount: formatCurrency({
      amount: Number(amount || 0) + Number(donationAmount || 0),
      currency,
      locale,
    }),
  });
};
