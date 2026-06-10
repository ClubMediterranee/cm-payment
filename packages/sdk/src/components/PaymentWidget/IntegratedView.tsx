import { useWatch } from '../../hooks/utils/useForm';
import { PspProviders } from '../../types/PspProviders';
import { CybersourceForm } from './integrations/CybersourceForm';
import { HipayForm } from './integrations/HipayForm';
import { WeChatQRView } from './WeChatQRView';

const paymentProvidersRegistry = {
  [PspProviders.HIPAY]: HipayForm,
  [PspProviders.MCYBERSOURCE]: CybersourceForm,
  [PspProviders.M99BILLW]: WeChatQRView,
};

export const IntegratedView = () => {
  const providerId = useWatch('provider_id');
  const Component = paymentProvidersRegistry[providerId as keyof typeof paymentProvidersRegistry];

  if (!Component) {
    return null;
  }

  return <Component />;
};
