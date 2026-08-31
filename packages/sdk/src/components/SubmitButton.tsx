import { Button } from '@clubmed/trident-ui/molecules/Buttons/Button';
import { type ComponentProps, useEffect } from 'react';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { usePaymentConfig } from '../hooks/data/usePaymentConfig';
import { useFormContext } from '../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { HipayPaypalButton } from './PaymentWidget/integrations/HipayPaypalButton';

export const SubmitButton = ({ children, ...props }: ComponentProps<typeof Button>) => {
  const watchedProvider = useWatchedPaymentProvider();
  const { iframe, thirdPartyIframe } = useProviderIntegrationMode();

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
      {children}
    </Button>
  );
};

SubmitButton.COMPONENT_KEY = TOKENS.SubmitButton;
