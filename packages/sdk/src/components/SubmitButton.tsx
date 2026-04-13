import { Button } from '@clubmed/trident-ui/molecules/Buttons/Button';
import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { useWatch } from '../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { TOKENS } from '../types/Tokens';

export const SubmitButton = ({ children, ...props }: ComponentProps<typeof Button>) => {
  const { iframe } = useProviderIntegrationMode();

  const watchedProviderId = useWatch('provider_id');
  const {
    formState: { isValid },
  } = useFormContext();

  const isThirdPartyIframe = GLOBAL_CAPS_SETTINGS.thirdPartyIframeProviders.includes(
    watchedProviderId as (typeof GLOBAL_CAPS_SETTINGS.thirdPartyIframeProviders)[number],
  );

  if (iframe || (isThirdPartyIframe && !isValid)) return null;

  return (
    <Button type="submit" form="payment-form" {...props}>
      {children}
    </Button>
  );
};

SubmitButton.COMPONENT_KEY = TOKENS.SubmitButton;
