import { useWatch } from '../../hooks/utils/useForm';
import { PspProviders } from '../../types/PspProviders';
import { HipayForm } from './integrations/HipayForm';

const paymentProvidersRegistry = {
  [PspProviders.HIPAY]: HipayForm,
};

export const HostedFieldView = () => {
  const providerId = useWatch('provider_id');
  const HostedFieldComponent =
    paymentProvidersRegistry[providerId as keyof typeof paymentProvidersRegistry];

  if (!HostedFieldComponent) {
    return null;
  }

  return <HostedFieldComponent />;
};
