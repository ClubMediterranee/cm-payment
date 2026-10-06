// Registers the payment provider forms.
import '../../integrations/ui.js';

import { useWatch } from '../../hooks/utils/useForm';
import { getPspComponent } from '../../utils/integrations/definePspProvider.js';

export const IntegratedView = () => {
  const providerId = useWatch('provider_id');
  const Component = getPspComponent(providerId);

  if (!Component) {
    return null;
  }

  return <Component />;
};
