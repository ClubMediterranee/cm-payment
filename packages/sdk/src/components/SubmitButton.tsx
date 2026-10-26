import { Button, type ButtonProps } from '@clubmed/trident-ui/ui/buttons/Button';
import { useEffect } from 'react';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { usePaymentConfig } from '../hooks/data/usePaymentConfig';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { formatCurrency } from '../utils/formatCurrency';
import { renderTemplate } from '../utils/renderTemplate';
// TODO voir pour utiliser la registry plutot qu'un import direct
import { HipayPaypalButton } from '../integrations/hipay-paypal/ui/HipayPaypalButton.js';

export const SubmitButton = (props: Omit<ButtonProps, 'children'>) => {
  const watchedProvider = useWatchedPaymentProvider();
  const { iframe, thirdPartyIframe, redirect } = useProviderIntegrationMode();
  const { content, locale } = useCapsConfigContext();
  const amount = useWatch('amount');
  const donationAmount = useWatch('donation_amount');
  const currency = useWatch('currency');

  const { data: paymentConfig } = usePaymentConfig();

  const {
    formState: { isValid },
    triggerAndTouch,
  } = useFormContext();

  const isPaypalButtonEnabled =
    watchedProvider?.category_payment_method === PaymentProvider1CategoryPaymentMethod.Paypal &&
    paymentConfig.feature_flips?.is_paypal_button_enabled;

  const isSubmitButtonDisabled = isPaypalButtonEnabled && !isValid;

  useEffect(() => {
    if (isSubmitButtonDisabled) {
      triggerAndTouch();
    }
  }, [isSubmitButtonDisabled]);

  if ((iframe && !thirdPartyIframe) || (thirdPartyIframe && !isValid)) return null;

  if (isPaypalButtonEnabled && isValid) {
    return <HipayPaypalButton />;
  }

  return (
    <Button type="submit" form="payment-form" {...props} disabled={isSubmitButtonDisabled}>
      {redirect
        ? content.submit.redirect
        : renderTemplate(content.submit.pay, {
            amount: formatCurrency({
              amount: Number(amount || 0) + Number(donationAmount || 0),
              currency,
              locale,
            }),
          })}
    </Button>
  );
};

SubmitButton.COMPONENT_KEY = TOKENS.SubmitButton;
