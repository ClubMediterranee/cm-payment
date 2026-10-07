import { definePspProvider } from '../../utils/integrations/definePspProvider.js';
import { PspProviders } from '../../types/PspProviders.js';
import { HipayForm } from './ui/HipayForm.js';

export default definePspProvider({
  id: PspProviders.HIPAY,
  component: HipayForm,
});
