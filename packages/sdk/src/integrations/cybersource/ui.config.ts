import { definePspProvider } from '../../utils/integrations/definePspProvider.js';
import { PspProviders } from '../../types/PspProviders.js';
import { CybersourceForm } from './ui/CybersourceForm.js';

export default definePspProvider({
  id: PspProviders.MCYBERSOURCE,
  component: CybersourceForm,
});
