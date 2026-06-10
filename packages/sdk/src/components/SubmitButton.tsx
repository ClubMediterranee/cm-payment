import { Button } from '@clubmed/trident-ui/molecules/Buttons/Button';
import { type ComponentProps, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { GLOBAL_CAPS_SETTINGS } from '../config';
import { usePaymentConfig } from '../hooks/data/usePaymentConfig';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { HipayPaypalButton } from './PaymentWidget/integrations/HipayPaypalButton';

export const SubmitButton = ({ children, ...props }: ComponentProps<typeof Button>) => {
  const watchedProvider = useWatchedPaymentProvider();
  const iframe = watchedProvider?.configuration?.display_type === 'iframe';

  const { data: paymentConfig } = usePaymentConfig();

  const {
    formState: { isValid },
    trigger,
  } = useFormContext();

  const isThirdPartyIframe = GLOBAL_CAPS_SETTINGS.thirdPartyIframeProviders.includes(
    watchedProvider?.id as (typeof GLOBAL_CAPS_SETTINGS.thirdPartyIframeProviders)[number],
  );

  const isPaypalButtonEnabled =
    watchedProvider?.category_payment_method === PaymentProvider1CategoryPaymentMethod.Paypal &&
    paymentConfig.feature_flips?.is_paypal_button_enabled;

  const isSubmitButtonDisabled = isPaypalButtonEnabled && !isValid;

  useEffect(() => {
    if (isSubmitButtonDisabled) {
      trigger();
    }
  }, [isSubmitButtonDisabled, trigger]);

  if (iframe || (isThirdPartyIframe && !isValid)) return null;

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
