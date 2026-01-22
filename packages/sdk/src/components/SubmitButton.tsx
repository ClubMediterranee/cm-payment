import { Button } from '@clubmed/trident-ui/molecules/Buttons/Button';
import type { ComponentProps } from 'react';

import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { TOKENS } from '../types/Tokens';

export const SubmitButton = ({ children, ...props }: ComponentProps<typeof Button>) => {
  const { iframe } = useProviderIntegrationMode();

  if (iframe) return null;

  return (
    <Button type="submit" form="payment-form" {...props}>
      {children}
    </Button>
  );
};

SubmitButton.COMPONENT_KEY = TOKENS.SubmitButton;
