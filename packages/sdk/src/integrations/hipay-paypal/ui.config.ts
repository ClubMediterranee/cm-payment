import { definePspProvider } from '../../utils/integrations/definePspProvider.js';
import { PspProviders } from '../../types/PspProviders.js';
import { HipayPaypalButton } from './ui/HipayPaypalButton.js';

export default definePspProvider({
  id: PspProviders.HIPAY_PAYPAL,
  kind: 'button',
  component: HipayPaypalButton,
});
