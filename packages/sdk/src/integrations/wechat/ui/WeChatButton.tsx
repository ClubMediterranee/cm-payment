import { Button } from '@clubmed/trident-ui/ui/buttons/Button';

import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import type { PspComponentProps } from '../../../utils/integrations/definePspProvider.js';
import { useWeChatQRCode } from '../hooks/useWeChatQRCode.js';

export const WeChatButton = ({ className }: PspComponentProps) => {
  const { content } = useCapsConfigContext();
  const { url } = useWeChatQRCode();

  if (url) return null;

  return (
    <Button type="submit" form="payment-form" className={className}>
      {content.submit.continue}
    </Button>
  );
};
